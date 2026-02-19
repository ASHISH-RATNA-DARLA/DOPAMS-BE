import { Prisma } from '@prisma/client';
import { prisma } from 'datasources/prisma';
import { AdvancedSearch, FirAdvancedFilterInput } from 'interfaces/advanced-search';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';

type Tables = 'crimes' | 'accused' | 'hierarchy' | 'persons' | 'brief_facts_accused';

const FIELD_MAP: Record<keyof AdvancedSearch, { base: string; table: Tables; jsonPath?: string; cast?: string }> = {
  // crimes table
  id: { base: '"id"', table: 'crimes' },
  psCode: { base: '"psCode"', table: 'crimes' },
  firNum: { base: '"firNum"', table: 'crimes' },
  firRegNum: { base: '"firRegNum"', table: 'crimes' },
  firType: { base: '"firType"', table: 'crimes' },
  sections: { base: '"sections"', table: 'crimes' },
  firDate: { base: '"firDate"', table: 'crimes', cast: 'date' },
  caseStatus: { base: '"caseStatus"', table: 'crimes' },
  caseClass: { base: '"caseClass"', table: 'crimes' },
  stipulatedPeriodForCS: { base: '"stipulatedPeriodForCS"', table: 'crimes' },
  majorHead: { base: '"majorHead"', table: 'crimes' },
  minorHead: { base: '"minorHead"', table: 'crimes' },
  crimeType: { base: '"crimeType"', table: 'crimes' },
  ioName: { base: '"ioName"', table: 'crimes' },
  ioRank: { base: '"ioRank"', table: 'crimes' },
  briefFacts: { base: '"briefFacts"', table: 'crimes' },

  // brief_facts_drugs table
  drugType: { base: '"drugDetails"', jsonPath: "'name'", table: 'crimes' },
  drugQuantityKg: { base: '"drugDetails"', jsonPath: "'quantityKg'", table: 'crimes' },
  drugQuantityMl: { base: '"drugDetails"', jsonPath: "'quantityMl'", table: 'crimes' },
  drugQuantityCount: { base: '"drugDetails"', jsonPath: "'quantityCount'", table: 'crimes' },
  drugWorth: { base: '"drugDetails"', jsonPath: "'worth'", table: 'crimes' },

  // hierarchy table
  psName: { base: '"psName"', table: 'hierarchy' },
  circleCode: { base: '"circleCode"', table: 'hierarchy' },
  circleName: { base: '"circleName"', table: 'hierarchy' },
  sdpoCode: { base: '"sdpoCode"', table: 'hierarchy' },
  sdpoName: { base: '"sdpoName"', table: 'hierarchy' },
  subZoneCode: { base: '"subZoneCode"', table: 'hierarchy' },
  subZoneName: { base: '"subZoneName"', table: 'hierarchy' },
  distCode: { base: '"distCode"', table: 'hierarchy' },
  distName: { base: '"distName"', table: 'hierarchy' },
  rangeCode: { base: '"rangeCode"', table: 'hierarchy' },
  rangeName: { base: '"rangeName"', table: 'hierarchy' },
  zoneCode: { base: '"zoneCode"', table: 'hierarchy' },
  zoneName: { base: '"zoneName"', table: 'hierarchy' },
  adgCode: { base: '"adgCode"', table: 'hierarchy' },
  adgName: { base: '"adgName"', table: 'hierarchy' },

  // accused table
  accusedCode: { base: '"accusedCode"', table: 'accused' },
  type: { base: '"type"', table: 'accused' },
  seqNum: { base: '"seqNum"', table: 'accused' },
  isCCL: { base: '"isCCL"', table: 'accused', cast: 'boolean' },
  beard: { base: '"beard"', table: 'accused' },
  build: { base: '"build"', table: 'accused' },
  color: { base: '"color"', table: 'accused' },
  ear: { base: '"ear"', table: 'accused' },
  eyes: { base: '"eyes"', table: 'accused' },
  face: { base: '"face"', table: 'accused' },
  hair: { base: '"hair"', table: 'accused' },
  height: { base: '"height"', table: 'accused' },
  leucoderma: { base: '"leucoderma"', table: 'accused' },
  mole: { base: '"mole"', table: 'accused' },
  mustache: { base: '"mustache"', table: 'accused' },
  nose: { base: '"nose"', table: 'accused' },
  teeth: { base: '"teeth"', table: 'accused' },
  accusedType: { base: '"accusedType"', table: 'accused' },
  accusedStatus: { base: '"accusedStatus"', table: 'accused' },

  // person table
  name: { base: '"name"', table: 'persons' },
  surname: { base: '"surname"', table: 'persons' },
  alias: { base: '"alias"', table: 'persons' },
  fullName: { base: '"fullName"', table: 'persons' },
  relationType: { base: '"relationType"', table: 'persons' },
  relativeName: { base: '"relativeName"', table: 'persons' },
  gender: { base: '"gender"', table: 'persons' },
  isDied: { base: '"isDied"', table: 'persons', cast: 'boolean' },
  dateOfBirth: { base: '"dateOfBirth"', table: 'persons', cast: 'timestamp' },
  age: { base: '"age"', table: 'persons', cast: 'integer' },
  occupation: { base: '"occupation"', table: 'persons' },
  educationQualification: { base: '"educationQualification"', table: 'persons' },
  caste: { base: '"caste"', table: 'persons' },
  subCaste: { base: '"subCaste"', table: 'persons' },
  religion: { base: '"religion"', table: 'persons' },
  domicile: { base: '"domicile"', table: 'persons' },
  nationality: { base: '"nationality"', table: 'persons' },
  designation: { base: '"designation"', table: 'persons' },
  placeOfWork: { base: '"placeOfWork"', table: 'persons' },
  presentHouseNo: { base: '"presentHouseNo"', table: 'persons' },
  presentStreetRoadNo: { base: '"presentStreetRoadNo"', table: 'persons' },
  presentWardColony: { base: '"presentWardColony"', table: 'persons' },
  presentAddress: { base: '"presentAddress"', table: 'persons' },
  presentLandmarkMilestone: { base: '"presentLandmarkMilestone"', table: 'persons' },
  presentLocalityVillage: { base: '"presentLocalityVillage"', table: 'persons' },
  presentAreaMandal: { base: '"presentAreaMandal"', table: 'persons' },
  presentDistrict: { base: '"presentDistrict"', table: 'persons' },
  presentStateUt: { base: '"presentStateUt"', table: 'persons' },
  presentCountry: { base: '"presentCountry"', table: 'persons' },
  presentResidencyType: { base: '"presentResidencyType"', table: 'persons' },
  presentPinCode: { base: '"presentPinCode"', table: 'persons' },
  presentJurisdictionPs: { base: '"presentJurisdictionPs"', table: 'persons' },
  permanentAddress: { base: '"permanentAddress"', table: 'persons' },
  permanentHouseNo: { base: '"permanentHouseNo"', table: 'persons' },
  permanentStreetRoadNo: { base: '"permanentStreetRoadNo"', table: 'persons' },
  permanentWardColony: { base: '"permanentWardColony"', table: 'persons' },
  permanentLandmarkMilestone: { base: '"permanentLandmarkMilestone"', table: 'persons' },
  permanentLocalityVillage: { base: '"permanentLocalityVillage"', table: 'persons' },
  permanentAreaMandal: { base: '"permanentAreaMandal"', table: 'persons' },
  permanentDistrict: { base: '"permanentDistrict"', table: 'persons' },
  permanentStateUt: { base: '"permanentStateUt"', table: 'persons' },
  permanentCountry: { base: '"permanentCountry"', table: 'persons' },
  permanentResidencyType: { base: '"permanentResidencyType"', table: 'persons' },
  permanentPinCode: { base: '"permanentPinCode"', table: 'persons' },
  permanentJurisdictionPs: { base: '"permanentJurisdictionPs"', table: 'persons' },
  phoneNumber: { base: '"phoneNumber"', table: 'persons' },
  countryCode: { base: '"countryCode"', table: 'persons' },
  emailId: { base: '"emailId"', table: 'persons' },
};

// 🔹 Operator mapping
const sqlOpMap: Record<FirAdvancedFilterInput['operator'], string> = {
  equals: '=',
  contains: 'ILIKE',
  startsWith: 'ILIKE',
  endsWith: 'ILIKE',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  between: 'BETWEEN',
};

function buildCondition(f: any, params: any[], paramIndex: number) {
  const { field, operator, value, value2 } = f;
  const info = FIELD_MAP[field];
  if (!info) throw new Error(`Unknown field: ${field}`);

  const sqlOp = sqlOpMap[operator];
  if (!sqlOp) throw new Error(`Unsupported operator: ${operator}`);

  const sqlType = info.cast || 'text';

  let valPattern = value;
  if (operator === 'contains') valPattern = `%${value}%`;
  else if (operator === 'startsWith') valPattern = `${value}%`;
  else if (operator === 'endsWith') valPattern = `%${value}`;

  if (operator === 'between') {
    params.push(value, value2);
    const p1 = `CAST($${paramIndex} AS ${sqlType})`;
    const p2 = `CAST($${paramIndex + 1} AS ${sqlType})`;

    if (!info.jsonPath) {
      return {
        condition: `${info.base}::${sqlType} BETWEEN ${p1} AND ${p2}`,
        nextIndex: paramIndex + 2,
      };
    }

    return {
      condition: `
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(${info.base}) AS elem
          WHERE (elem->>${info.jsonPath})::${sqlType} BETWEEN ${p1} AND ${p2}
        )
      `,
      nextIndex: paramIndex + 2,
    };
  }

  params.push(valPattern);
  const p1 = `CAST($${paramIndex} AS ${sqlType})`;

  if (!info.jsonPath) {
    return {
      condition:
        operator === 'contains' || operator === 'startsWith' || operator === 'endsWith'
          ? `${info.base} ${sqlOp} ${p1}`
          : `${info.base}::${sqlType} ${sqlOp} ${p1}`,
      nextIndex: paramIndex + 1,
    };
  }

  return {
    condition: `
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(${info.base}) AS elem
        WHERE (elem->>${info.jsonPath})::${sqlType} ${sqlOp} ${p1}
      )
    `,
    nextIndex: paramIndex + 1,
  };
}

function buildPagination(page: number = 1, limit: number = 100) {
  if (limit === -1) return ''; // fetch all when limit is -1
  const safePage = page < 1 ? 1 : page;
  const safeLimit = limit < 1 ? 100 : limit;
  const offset = (safePage - 1) * safeLimit;
  return `LIMIT ${limit} OFFSET ${offset}`;
}

function buildPageInfo(page: number, limit: number, totalCount: number): PageNumberPaginationMeta<true> {
  const previousPage = page > 1 ? page - 1 : null;
  const pageCount = limit === null ? 1 : Math.ceil(totalCount / limit);
  const nextPage = page < pageCount ? page + 1 : null;

  return {
    isFirstPage: previousPage === null,
    isLastPage: nextPage === null,
    currentPage: page,
    previousPage,
    nextPage,
    pageCount,
    totalCount,
  };
}

function buildSelect(selectedFields: (keyof AdvancedSearch)[]): string {
  return selectedFields
    .map(field => field.trim())
    .map(field => `"${field}"`)
    .join(', ');
}

export function buildFilters(filters: FirAdvancedFilterInput[]) {
  const params: any[] = [];
  const clauses: string[] = [];
  let paramIndex = 1;

  for (const f of filters) {
    const { condition, nextIndex } = buildCondition(f, params, paramIndex);
    paramIndex = nextIndex;
    clauses.push(condition);
  }

  const combined = filters.reduce((acc, f, i) => {
    const connector = f.connector?.toUpperCase() || 'AND';
    return i === 0 ? clauses[i] : `${acc} ${connector} ${clauses[i]}`;
  }, '');

  return {
    whereClause: combined ? `WHERE ${combined}` : '',
    params,
  };
}

function buildSorting(sortKey: keyof AdvancedSearch = 'firDate', sortOrder: Prisma.SortOrder = 'desc'): string {
  const safeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${sortKey}" ${safeSortOrder} NULLS LAST`;
}

export async function advancedSearch(
  page: number = 1,
  limit: number = 100,
  sortKey: keyof AdvancedSearch = 'firDate',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: FirAdvancedFilterInput[] = [],
  selectedFields: (keyof AdvancedSearch)[] = []
) {
  const sortTable = FIELD_MAP[sortKey];
  const sortsAccused = ['accused', 'persons'].includes(sortTable.table);
  const selectsAccused = selectedFields.some(f => ['accused', 'persons'].includes(FIELD_MAP[f].table));
  const filtersAccused = filters.some(f => ['accused', 'persons'].includes(FIELD_MAP[f.field].table));

  const includeAccused = selectsAccused || filtersAccused || sortsAccused;

  const selectClause = buildSelect(selectedFields);
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);
  let view = includeAccused ? 'advanced_search_accuseds_mv' : 'advanced_search_firs_mv';

  // Execute queries
  const [nodes, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe<AdvancedSearch[]>(
      `SELECT ${selectClause} FROM ${view} ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int FROM ${view} ${whereClause};`, ...params),
  ]);

  const pageInfo = buildPageInfo(page, limit, totalCount[0].count);

  return { nodes, pageInfo };
}

type FieldAutocompleteResult = { field: keyof AdvancedSearch; value: string };

export async function fieldAutocomplete(
  fields: (keyof AdvancedSearch)[],
  input: string
): Promise<FieldAutocompleteResult[]> {
  const uniqueFields = Array.from(new Set(fields ?? []));
  if (uniqueFields.length === 0) return [];

  const search = input?.trim();
  if (!search) return [];

  const descriptors = uniqueFields.map(field => {
    const info = FIELD_MAP[field];
    if (!info) throw new Error(`Unknown field: ${field}`);
    const includeAccused = ['accused', 'persons'].includes(info.table);
    const view = includeAccused ? 'advanced_search_accuseds_mv' : 'advanced_search_firs_mv';
    return { field, info, view };
  });

  const likeParam = `%${search}%`;

  const selectStatements = descriptors.map(({ field, info, view }) => {
    if (info.jsonPath) {
      return `
        SELECT DISTINCT '${field}' AS field, elem->>${info.jsonPath} AS value
        FROM ${view}
        CROSS JOIN LATERAL jsonb_array_elements(${info.base}) AS elem
        WHERE elem->>${info.jsonPath} ILIKE $1
          AND elem->>${info.jsonPath} IS NOT NULL
      `;
    }

    return `
      SELECT DISTINCT '${field}' AS field, (${info.base})::text AS value
      FROM ${view}
      WHERE (${info.base})::text ILIKE $1
        AND ${info.base} IS NOT NULL
    `;
  });

  if (selectStatements.length === 0) return [];

  const unionQuery = selectStatements.join(' UNION ALL ');
  const query = `SELECT field, value FROM (${unionQuery}) AS combined WHERE value IS NOT NULL`;

  const rows = await prisma.$queryRawUnsafe<{ field: string; value: string }[]>(query, likeParam);
  return rows
    .filter(row => Boolean(row.value))
    .map(row => ({ field: row.field as keyof AdvancedSearch, value: row.value }));
}
