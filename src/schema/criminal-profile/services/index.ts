import { CriminalProfiles, Prisma } from '@prisma/client';
import { prisma } from 'datasources/prisma';
import { FileUpload } from 'graphql-upload-ts';
import { CriminalProfileFilterInput } from 'interfaces/criminal-profile';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import ResourceNotFoundException from 'utils/errors/resource-not-found';
import { processFileUploadToTomcat } from 'utils/misc';

function buildPagination(page: number = 1, limit: number = 100) {
  if (limit === -1) return '';
  const safePage = page < 1 ? 1 : page;
  const safeLimit = limit < 1 ? 100 : limit;
  const offset = (safePage - 1) * safeLimit;
  return `LIMIT ${limit} OFFSET ${offset}`;
}

function buildPageInfo(page: number, limit: number, total: BigInt): PageNumberPaginationMeta<true> {
  const previousPage = page > 1 ? page - 1 : null;
  const pageCount = limit === null ? 1 : Math.ceil(Number(total) / limit);
  const nextPage = page < pageCount ? page + 1 : null;

  return {
    isFirstPage: previousPage === null,
    isLastPage: nextPage === null,
    currentPage: page,
    previousPage,
    nextPage,
    pageCount,
    totalCount: Number(total),
  };
}

function buildSorting(
  sortKey: keyof Prisma.CriminalProfilesOrderByWithRelationInput = 'noOfCrimes',
  sortOrder: Prisma.SortOrder = 'desc'
) {
  const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${sortKey}" ${safeSortOrder} NULLS LAST`;
}

export async function getCriminalProfile(id: string) {
  const result = await prisma.$queryRawUnsafe<CriminalProfiles[]>(
    `SELECT * FROM criminal_profiles_mv WHERE id = $1 LIMIT 1;`,
    id
  );
  const criminalProfile = result[0];

  if (!criminalProfile) throw new ResourceNotFoundException('Criminal Profile Not Found');
  return criminalProfile;
}

export function buildFilters(filters: CriminalProfileFilterInput = {}) {
  const clauses: string[] = [];
  const params: any[] = [];

  const name = filters.name?.trim();
  if (name && name.length) {
    params.push(`%${name}%`);
    clauses.push(`
      "name" ILIKE $${params.length}
      OR "surname" ILIKE $${params.length}
      OR "fullName" ILIKE $${params.length}
      OR "relativeName" ILIKE $${params.length}
      OR "emailId" ILIKE $${params.length}
      OR "alias" ILIKE $${params.length}
    `);
  }

  // ---------- Final where clause ----------
  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  return { whereClause, params };
}

export async function getCriminalProfiles(
  page: number = 1,
  limit: number = 10,
  sortKey: keyof Prisma.CriminalProfilesOrderByWithRelationInput = 'noOfCrimes',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: CriminalProfileFilterInput = {}
) {
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);

  const [nodes, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe<CriminalProfiles[]>(
      `SELECT * from criminal_profiles_mv ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: BigInt }[]>(`SELECT COUNT(*) from criminal_profiles_mv ${whereClause};`, ...params),
  ]);

  const pageInfo = buildPageInfo(page, limit, totalCount[0].count);

  return { nodes, pageInfo };
}

export async function uploadCriminalProfileFile(file: FileUpload, id: string) {
  const { fileName, viewUrl } = await processFileUploadToTomcat(file, `criminal-profile-media/${id}`);

  await prisma.$transaction([
    prisma.$executeRawUnsafe(`ALTER TABLE files DISABLE TRIGGER trigger_auto_generate_file_paths;`),
    prisma.file.create({
      data: {
        parentId: id,
        sourceField: 'MEDIA',
        sourceType: 'person',
        filePath: viewUrl,
        fileUrl: `${process.env.TOMCAT_FILE_API_URL}${viewUrl}`,
        notes: fileName,
        hasField: true,
        isEmpty: false,
      },
    }),
    prisma.$executeRawUnsafe(`ALTER TABLE files ENABLE TRIGGER trigger_auto_generate_file_paths;`),
  ]);

  return 'File uploaded successfully';
}
