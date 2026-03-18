import { Prisma } from '@prisma/client';
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

function buildSorting(sortKey: string = 'noOfCrimes', sortOrder: Prisma.SortOrder = 'desc') {
  const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${String(sortKey)}" ${safeSortOrder} NULLS LAST`;
}

/**
 * Fetch full crime rows from accuseds_mv for a given person_id.
 *
 * accuseds_mv contains every field the frontend CrimeHistory component needs:
 *   ps, unit, firNumber, firRegNum, crimeRegDate, caseStatus,
 *   accusedType, accusedCode (bfa.person_code), accusedStatus,
 *   seqNum, isCCL, physical features.
 *
 * Chargesheets and interrogation reports are fetched in a second query and
 * attached per crime_id.
 */
async function fetchCrimesForPerson(personId: string): Promise<any[]> {
  // 1. Fetch accused rows from accuseds_mv
  const accusedRows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT
       "crimeId"         AS id,
       unit,
       ps,
       year,
       "firNumber",
       "firRegNum",
       section,
       "crimeRegDate",
       "majorHead",
       "minorHead",
       "crimeType",
       "ioName",
       "ioRank",
       "briefFacts",
       "accusedCode",
       "accusedRole"     AS "accusedType",
       "accusedStatus",
       "seqNum",
       "isCCL",
       beard, build, color, ear, eyes, face, hair, height,
       leucoderma, mole, mustache, nose, teeth,
       "caseStatus"
     FROM accuseds_mv
     WHERE "personId" = $1`,
    personId
  );

  if (!accusedRows.length) return [];

  const crimeIds = accusedRows.map(r => r.id);

  // 2. Fetch chargesheets with acts and accused info
  const chargesheets = await prisma.$queryRawUnsafe<any[]>(
    `SELECT
       cs.id,
       cs.crime_id        AS "crimeId",
       cs.chargesheet_no  AS "chargesheetNo",
       cs.chargesheet_no_icjs AS "chargesheetNoIcjs",
       cs.chargesheet_date    AS "chargesheetDate",
       cs.chargesheet_type    AS "chargesheetType",
       cs.court_name          AS "courtName",
       cs.is_ccl              AS "isCcl",
       cs.is_esigned          AS "isEsigned",
       cs.date_created        AS "dateCreated",
       cs.date_modified       AS "dateModified",
       COALESCE(
         (SELECT jsonb_agg(jsonb_build_object(
           'id',                 ca.id,
           'actDescription',     ca.act_description,
           'section',            ca.section,
           'rwRequired',         ca.rw_required,
           'sectionDescription', ca.section_description,
           'graveParticulars',   ca.grave_particulars,
           'createdAt',          ca.created_at
         )) FROM chargesheet_acts ca WHERE ca.chargesheet_id = cs.id),
         '[]'::jsonb
       ) AS acts,
       (SELECT jsonb_build_object(
           'id',                   cha.id,
           'personId',             cha.accused_person_id,
           'chargeStatus',         cha.charge_status,
           'requestedForNbw',      cha.requested_for_nbw,
           'reasonForNoCharge',    cha.reason_for_no_charge,
           'isPersonMasterPresent',cha.is_person_master_present,
           'createdAt',            cha.created_at
         )
         FROM chargesheet_accused cha
         WHERE cha.chargesheet_id = cs.id
           AND cha.accused_person_id = $2
         LIMIT 1
       ) AS accuseds
     FROM chargesheets cs
     WHERE cs.crime_id = ANY($1::text[])`,
    crimeIds,
    personId
  );

  // 3. Fetch interrogation reports
  const irRows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT
       ir.interrogation_report_id AS "interrogationReportId",
       ir.crime_id                AS "crimeId",
       ir.person_id               AS "personId",
       ir.physical_beard          AS "physicalBeard",
       ir.physical_build          AS "physicalBuild",
       ir.physical_burn_marks     AS "physicalBurnMarks",
       ir.physical_color          AS "physicalColor",
       ir.physical_deformities_or_peculiarities AS "physicalDeformitiesOrPeculiarities",
       ir.physical_deformities    AS "physicalDeformities",
       ir.physical_ear            AS "physicalEar",
       ir.physical_eyes           AS "physicalEyes",
       ir.physical_face           AS "physicalFace",
       ir.physical_hair           AS "physicalHair",
       ir.physical_height         AS "physicalHeight",
       ir.physical_identification_marks AS "physicalIdentificationMarks",
       ir.physical_language_or_dialect  AS "physicalLanguageOrDialect",
       ir.physical_leucoderma     AS "physicalLeucoderma",
       ir.physical_mole           AS "physicalMole",
       ir.physical_mustache       AS "physicalMustache",
       ir.physical_nose           AS "physicalNose",
       ir.physical_scar           AS "physicalScar",
       ir.physical_tattoo         AS "physicalTattoo",
       ir.physical_teeth          AS "physicalTeeth",
       ir.socio_living_status     AS "socioLivingStatus",
       ir.socio_marital_status    AS "socioMaritalStatus",
       ir.socio_education         AS "socioEducation",
       ir.socio_occupation        AS "socioOccupation",
       ir.socio_income_group      AS "socioIncomeGroup",
       ir.offence_time            AS "offenceTime",
       ir.other_offence_time      AS "otherOffenceTime",
       ir.share_of_amount_spent   AS "shareOfAmountSpent",
       ir.other_share_of_amount_spent AS "otherShareOfAmountSpent",
       ir.share_remarks           AS "shareRemarks",
       ir.is_in_jail              AS "isInJail",
       ir.from_where_sent_in_jail AS "fromWhereSentInJail",
       ir.in_jail_crime_num       AS "inJailCrimeNum",
       ir.in_jail_dist_unit       AS "inJailDistUnit",
       ir.is_on_bail              AS "isOnBail",
       ir.from_where_sent_on_bail AS "fromWhereSentOnBail",
       ir.on_bail_crime_num       AS "onBailCrimeNum",
       ir.date_of_bail            AS "dateOfBail",
       ir.is_absconding           AS "isAbsconding",
       ir.wanted_in_police_station AS "wantedInPoliceStation",
       ir.absconding_crime_num    AS "abscondingCrimeNum",
       ir.is_normal_life          AS "isNormalLife",
       ir.eking_livelihood_by_labor_work AS "ekingLivelihoodByLaborWork",
       ir.is_rehabilitated        AS "isRehabilitated",
       ir.rehabilitation_details  AS "rehabilitationDetails",
       ir.is_dead                 AS "isDead",
       ir.death_details           AS "deathDetails",
       ir.is_facing_trial         AS "isFacingTrial",
       ir.facing_trial_ps_name    AS "facingTrialPsName",
       ir.facing_trial_crime_num  AS "facingTrialCrimeNum",
       ir.other_regular_habits    AS "otherRegularHabits",
       ir.other_indulgence_before_offence AS "otherIndulgenceBeforeOffence",
       ir.time_since_modus_operandi AS "timeSinceModusOperandi",
       ir.date_created            AS "dateCreated",
       ir.date_modified           AS "dateModified"
     FROM interrogation_reports ir
     WHERE ir.crime_id = ANY($1::text[])
       AND ir.person_id = $2`,
    crimeIds,
    personId
  );

  // 4. Group chargesheets and IR by crime_id
  const csMap = new Map<string, any[]>();
  for (const cs of chargesheets) {
    const list = csMap.get(cs.crimeId) ?? [];
    list.push({
      ...cs,
      acts: typeof cs.acts === 'string' ? JSON.parse(cs.acts) : (cs.acts ?? []),
      accuseds: typeof cs.accuseds === 'string' ? JSON.parse(cs.accuseds) : cs.accuseds,
    });
    csMap.set(cs.crimeId, list);
  }

  const irMap = new Map<string, any[]>();
  for (const ir of irRows) {
    const list = irMap.get(ir.crimeId) ?? [];
    list.push({
      ...ir,
      associateDetails: [],
      consumerDetails: [],
      defenceCounsel: [],
      dopamsLinks: [],
      familyHistory: [],
      financialHistory: [],
      localContacts: [],
      modusOperandi: [],
      previousOffencesConfessed: [],
      regularHabits: [],
      shelter: [],
      simDetails: [],
      typesOfDrugs: [],
    });
    irMap.set(ir.crimeId, list);
  }

  // 5. Merge into accused rows
  return accusedRows.map(row => ({
    ...row,
    chargesheets: csMap.get(row.id) ?? [],
    interrogationReports: irMap.get(row.id) ?? [],
  }));
}

export async function getCriminalProfile(id: string) {
  // Fetch base profile from criminal_profiles_mv
  const result = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM criminal_profiles_mv WHERE id = $1 LIMIT 1;`, id);
  const profile = result[0];
  if (!profile) throw new ResourceNotFoundException('Criminal Profile Not Found');

  // Fetch full crime details from accuseds_mv (new schema no longer embeds them in the MV)
  const crimes = await fetchCrimesForPerson(id);
  profile.crimes = crimes;

  return profile;
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

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereClause, params };
}

export async function getCriminalProfiles(
  page: number = 1,
  limit: number = 10,
  sortKey: string = 'noOfCrimes',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: CriminalProfileFilterInput = {}
) {
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);

  const [nodes, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT * from criminal_profiles_mv ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: BigInt }[]>(`SELECT COUNT(*) from criminal_profiles_mv ${whereClause};`, ...params),
  ]);

  // For the list view the frontend only needs lightweight profile cards —
  // crimes array is populated lazily when viewing a single profile.
  // Return lightweight crimes stubs (id + firNumber + crimeRegDate) from the MV.
  const mappedNodes = nodes.map(profile => ({
    ...profile,
    crimes: (() => {
      if (!profile.crimes) return [];
      const raw = typeof profile.crimes === 'string' ? JSON.parse(profile.crimes) : profile.crimes;
      return (raw ?? []).map((c: any) => ({
        id: c.id ?? c.crime_id,
        firNumber: c.firNumber ?? c.fir_num,
        crimeRegDate: c.crimeRegDate ?? c.fir_date,
        chargesheets: [],
        interrogationReports: [],
      }));
    })(),
  }));

  const pageInfo = buildPageInfo(page, limit, totalCount[0].count);
  return { nodes: mappedNodes, pageInfo };
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
