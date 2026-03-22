import { Accused, Prisma } from '@prisma/client';
import { prisma } from 'datasources/prisma';

import { AccusedFilterInput } from 'interfaces/accused';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import ResourceNotFoundException from 'utils/errors/resource-not-found';

function buildPagination(page: number = 1, limit: number = 100) {
  if (limit === -1) return ''; // fetch all when limit is -1
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
  sortKey: keyof Prisma.AccusedOrderByWithRelationInput = 'dateCreated',
  sortOrder: Prisma.SortOrder = 'desc'
) {
  const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${String(sortKey)}" ${safeSortOrder} NULLS LAST`;
}

export function buildFilters(filters: AccusedFilterInput = {}) {
  const clauses: string[] = [];
  const params: any[] = [];

  const name = filters.name?.trim();
  if (name && name.length) {
    params.push(`%${name}%`);
    const nameConditions = [
      `"name" ILIKE $${params.length}`,
      `"fullName" ILIKE $${params.length}`,
      `"surname" ILIKE $${params.length}`,
      `"alias" ILIKE $${params.length}`,
      `"emailId" ILIKE $${params.length}`,
      `"parentage" ILIKE $${params.length}`,
    ];
    clauses.push(`(${nameConditions.join(' OR ')})`);
  }

  const units = filters.units;
  if (units && units.length) {
    params.push(units);
    clauses.push(`"unit" ILIKE ANY($${params.length}::text[])`);
  }

  const nationality = filters.nationality;
  if (nationality && nationality.length) {
    params.push(nationality);
    clauses.push(`"nationality" ILIKE ANY($${params.length}::text[])`);
  }

  const state = filters.state;
  if (state && state.length) {
    params.push(state);
    clauses.push(`"presentStateUt" ILIKE ANY($${params.length}::text[])`);
  }

  const gender = filters.gender;
  if (gender && gender.length) {
    params.push(gender);
    clauses.push(`"gender" ILIKE ANY($${params.length}::text[])`);
  }

  const caseStatus = filters.caseStatus;
  if (caseStatus && caseStatus.length) {
    params.push(caseStatus);
    clauses.push(`"caseStatus" ILIKE ANY($${params.length}::text[])`);
  }

  const domicileClass = filters.domicileClass;
  if (domicileClass && domicileClass.length) {
    params.push(domicileClass);
    clauses.push(`"domicile" ILIKE ANY($${params.length}::text[])`);
  }

  const ps = filters.ps;
  if (ps && ps.length) {
    params.push(ps);
    clauses.push(`"ps" ILIKE ANY($${params.length}::text[])`);
  }

  const caseClass = filters.caseClass;
  if (caseClass && caseClass.length) {
    params.push(caseClass);
    clauses.push(`"caseClassification" ILIKE ANY($${params.length}::text[])`);
  }

  const accusedStatus = filters.accusedStatus;
  if (accusedStatus && accusedStatus.length) {
    params.push(accusedStatus);
    clauses.push(`"accusedStatus" ILIKE ANY($${params.length}::text[])`);
  }

  const accusedType = filters.accusedType;
  if (accusedType && accusedType.length) {
    params.push(accusedType);
    clauses.push(`"accusedType" ILIKE ANY($${params.length}::text[])`);
  }

  const accusedRole = filters.accusedRole;
  if (accusedRole && accusedRole.length) {
    params.push(accusedRole);
    clauses.push(`"accusedRole" ILIKE ANY($${params.length}::text[])`);
  }

  const drugTypes = filters.drugTypes;
  if (drugTypes && drugTypes.length) {
    params.push(drugTypes);
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM unnest("drugType") AS "drugNames"
        WHERE "drugNames" ILIKE ANY(SELECT '%' || unnest($${params.length}::text[]) || '%')
      )
    `);
  }

  const domicile = filters.domicile;
  if (domicile && Object.keys(domicile).length > 0) {
    // Map the domicile input keys to the corresponding flat columns in accuseds_mv.
    // The domicile filter searches present/permanent address fields directly on the MV row —
    // NOT inside "accusedDetails" (which now holds co-accused person data, not address data).
    const domicileColumnMap: Record<string, string> = {
      houseNo: 'presentHouseNo',
      streetRoadNo: 'presentStreetRoadNo',
      wardColony: 'presentWardColony',
      landmarkMilestone: 'presentLandmarkMilestone',
      localityVillage: 'presentLocalityVillage',
      areaMandal: 'presentAreaMandal',
      district: 'presentDistrict',
      stateUT: 'presentStateUt',
      country: 'presentCountry',
      residencyType: 'presentResidencyType',
      pinCode: 'presentPinCode',
      jurisdictionPS: 'presentJurisdictionPs',
    };

    Object.entries(domicile).forEach(([key, value]) => {
      const col = domicileColumnMap[key];
      if (col && value && value.trim() !== '') {
        params.push(`%${value}%`);
        clauses.push(`"${col}" ILIKE $${params.length}`);
      }
    });
  }

  const accusedSearch = filters.accuseds;
  if (accusedSearch && accusedSearch.length) {
    params.push(accusedSearch);
    clauses.push(`
        NOT EXISTS (
            SELECT 1
            FROM unnest($${params.length}::text[]) AS term
            WHERE NOT EXISTS (
                SELECT 1
                FROM jsonb_array_elements("accusedDetails") WITH ORDINALITY AS elem(obj, elem_index)
                WHERE
                obj->>'name' ILIKE '%' || term || '%'
                OR obj->>'surname' ILIKE '%' || term || '%'
                OR obj->>'alias' ILIKE '%' || term || '%'
                OR obj->>'fullName' ILIKE '%' || term || '%'
                OR obj->>'email' ILIKE '%' || term || '%'
            )
        )
        AND (
            SELECT COUNT(DISTINCT elem_index)
            FROM jsonb_array_elements("accusedDetails") WITH ORDINALITY AS elem(obj, elem_index)
            WHERE EXISTS (
                SELECT 1
                FROM unnest($${params.length}::text[]) AS term
                WHERE
                obj->>'name' ILIKE '%' || term || '%'
                OR obj->>'surname' ILIKE '%' || term || '%'
                OR obj->>'alias' ILIKE '%' || term || '%'
                OR obj->>'fullName' ILIKE '%' || term || '%'
                OR obj->>'email' ILIKE '%' || term || '%'
            )
        ) = array_length($${params.length}::text[], 1)
    `);
  }

  const { from: fAge, to: tAge } = filters.ageRange || {};
  if (fAge !== undefined && tAge !== undefined && fAge <= tAge) {
    params.push(fAge, tAge);
    clauses.push(`"age"::int BETWEEN $${params.length - 1}::int AND $${params.length}::int`);
  } else if (fAge !== undefined) {
    params.push(fAge);
    clauses.push(`"age"::int >= $${params.length}::int`);
  } else if (tAge !== undefined) {
    params.push(tAge);
    clauses.push(`"age"::int <= $${params.length}::int`);
  }

  // ---------- Year Filters ----------
  const yearConditions: string[] = [];
  const { from: fDate, to: tDate } = filters.dateRange || {};
  const validYears = (filters.years || []).filter(y => Number.isInteger(y));

  // Year range
  if (fDate !== undefined && tDate !== undefined && fDate <= tDate) {
    params.push(fDate, tDate);
    yearConditions.push(`"crimeRegDate"::date BETWEEN $${params.length - 1}::date AND $${params.length}::date`);
  } else if (fDate !== undefined) {
    params.push(fDate);
    yearConditions.push(`"crimeRegDate"::date >= $${params.length}::date`);
  } else if (tDate !== undefined) {
    params.push(tDate);
    yearConditions.push(`"crimeRegDate"::date <= $${params.length}::date`);
  }

  // Specific year list
  if (validYears.length > 0) {
    params.push(validYears);
    yearConditions.push(`"year" = ANY($${params.length}::int[])`);
  }

  if (yearConditions.length > 0) {
    clauses.push(`(${yearConditions.join(' OR ')})`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  return { whereClause, params };
}

export async function getAccused(id: string) {
  const result = await prisma.$queryRawUnsafe<Accused[]>(`SELECT * FROM accuseds_mv WHERE id = $1 LIMIT 1;`, id);
  const accused = result[0];

  if (!accused) throw new ResourceNotFoundException('Accused Not Found');

  // accuseds_mv COUNT(*) subqueries return BigInt — coerce to Number for GraphQLInt.
  if (typeof (accused as any).noOfAccusedInvolved === 'bigint') {
    (accused as any).noOfAccusedInvolved = Number((accused as any).noOfAccusedInvolved);
  }
  if (typeof (accused as any).noOfCrimes === 'bigint') {
    (accused as any).noOfCrimes = Number((accused as any).noOfCrimes);
  }

  // MV now returns previouslyInvolvedCases as { crimeId, firNumber }.
  // Remap to { id, value } to match the GraphQL CrimeDetailsType and frontend expectations.
  if (Array.isArray((accused as any).previouslyInvolvedCases)) {
    (accused as any).previouslyInvolvedCases = (accused as any).previouslyInvolvedCases.map(
      (c: { crimeId: string; firNumber: string }) => ({
        id: c.crimeId,
        value: c.firNumber,
      })
    );
  }

  return accused;
}

export async function getAccuseds(
  page: number = 1,
  limit: number = 100,
  sortKey: keyof Prisma.AccusedOrderByWithRelationInput = 'dateCreated',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: AccusedFilterInput = {}
) {
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);

  const [nodes, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe<Accused[]>(
      `SELECT * from accuseds_mv ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: BigInt }[]>(`SELECT COUNT(*) from accuseds_mv ${whereClause};`, ...params),
  ]);

  // MV now returns previouslyInvolvedCases as { crimeId, firNumber }.
  // Remap to { id, value } to match the GraphQL CrimeDetailsType and frontend expectations.
  // Also coerce BigInt fields from COUNT(*) subqueries to Number for GraphQLInt.
  for (const node of nodes) {
    if (typeof (node as any).noOfAccusedInvolved === 'bigint') {
      (node as any).noOfAccusedInvolved = Number((node as any).noOfAccusedInvolved);
    }
    if (typeof (node as any).noOfCrimes === 'bigint') {
      (node as any).noOfCrimes = Number((node as any).noOfCrimes);
    }
    if (Array.isArray((node as any).previouslyInvolvedCases)) {
      (node as any).previouslyInvolvedCases = (node as any).previouslyInvolvedCases.map(
        (c: { crimeId: string; firNumber: string }) => ({
          id: c.crimeId,
          value: c.firNumber,
        })
      );
    }
  }

  const pageInfo = buildPageInfo(page, limit, totalCount[0].count);

  return { nodes, pageInfo };
}

export async function getAccusedStatistics(filters: AccusedFilterInput = {}) {
  const { whereClause: where, params } = buildFilters(filters);
  const totalCountResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM accuseds_mv ${where};`,
    ...params
  );

  const totalAccused = totalCountResult[0].count;
  if (totalAccused === 0) {
    return {
      totalAccused,
      accusedStatisticsBreakdownByAge: [],
      accusedStatisticsBreakdownByDomicile: [],
      accusedStatisticsBreakdownByCaseClass: [],
      accusedStatisticsBreakdownByGender: [],
      accusedStatisticsBreakdownByCaseStatus: [],
      accusedStatisticsBreakdownByAccusedType: [],
      accusedStatisticsBreakdownByAccusedStatus: [],
      accusedStatisticsBreakdownByNativeState: [],
      accusedStatisticsBreakdownByNationality: [],
      accusedStatisticsBreakdownByAccusedRole: [],
    };
  }

  // Build additional WHERE clause for nationality filter in native state query
  const nationalityFilter =
    filters.nationality && filters.nationality.length > 0
      ? `AND EXISTS (
        SELECT 1 FROM unnest($${params.length + 1}::text[]) AS arr(val)
        WHERE a."nationality" ILIKE '%' || val || '%'
      )`
      : '';
  const nativeStateParams =
    filters.nationality && filters.nationality.length > 0 ? [...params, filters.nationality] : params;

  const [
    genderWise,
    stateWise,
    countryWise,
    accusedTypeWise,
    accusedStatusWise,
    ageWise,
    caseStatusWise,
    caseClassWise,
    domicileWise,
    accusedRoleWise,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM(gender), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("permanentStateUt"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
          ${nationalityFilter}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...nativeStateParams
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM(nationality), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("accusedType"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    // UPDATED: accusedStatus is now normalized in the MV — read directly
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("accusedStatus"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) grouped
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT
          label,
          COUNT(*)::int AS count
        FROM (
          SELECT
            CASE
              WHEN age IS NULL OR age = -100 THEN 'Unknown'
              WHEN age > 0 AND age < 18 THEN 'Juvenile'
              ELSE 'Adult'
            END AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("caseStatus"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("caseClassification"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM(domicile), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT label, COUNT(*)::int AS count
        FROM (
          SELECT COALESCE(NULLIF(TRIM("accusedRole"), ''), 'Unknown') AS label
          FROM accuseds_mv
          ${where}
        ) t
        GROUP BY label
        ORDER BY 
          CASE WHEN label = 'Unknown' THEN 1 ELSE 0 END,
          count DESC;
      `,
      ...params
    ),
  ]);

  return {
    totalAccused,
    accusedStatisticsBreakdownByAge: ageWise,
    accusedStatisticsBreakdownByDomicile: domicileWise,
    accusedStatisticsBreakdownByCaseClass: caseClassWise,
    accusedStatisticsBreakdownByGender: genderWise,
    accusedStatisticsBreakdownByCaseStatus: caseStatusWise,
    accusedStatisticsBreakdownByAccusedType: accusedTypeWise,
    accusedStatisticsBreakdownByAccusedStatus: accusedStatusWise,
    accusedStatisticsBreakdownByNativeState: stateWise,
    accusedStatisticsBreakdownByNationality: countryWise,
    accusedStatisticsBreakdownByAccusedRole: accusedRoleWise,
  };
}

export async function getAccusedFilterValues(filters: AccusedFilterInput = {}) {
  const { whereClause, params } = buildFilters({ ...filters });

  const [
    caseClass,
    caseStatus,
    accusedStatus,
    accusedType,
    domicile,
    ps,
    gender,
    years,
    state,
    nationality,
    units,
    drugTypes,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<{ caseClassification: string }[]>(
      `SELECT DISTINCT a."caseClassification" from accuseds_mv a ${whereClause} ORDER BY a."caseClassification";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ caseStatus: string }[]>(
      `SELECT DISTINCT a."caseStatus" from accuseds_mv a ${whereClause} ORDER BY a."caseStatus";`,
      ...params
    ),
    // UPDATED: accusedStatus is now normalized in the MV — read directly
    prisma.$queryRawUnsafe<{ accusedStatus: string }[]>(
      `
        SELECT DISTINCT a."accusedStatus"
        FROM accuseds_mv a
        ${whereClause}
        ORDER BY a."accusedStatus";
      `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ accusedType: string }[]>(
      `SELECT DISTINCT a."accusedType" from accuseds_mv a ${whereClause} ORDER BY a."accusedType";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ domicile: string }[]>(
      `SELECT DISTINCT a."domicile" from accuseds_mv a ${whereClause} ORDER BY a."domicile";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ ps: string }[]>(
      `SELECT DISTINCT a."ps" from accuseds_mv a ${whereClause} ORDER BY a."ps";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ gender: string }[]>(
      `SELECT DISTINCT a."gender" from accuseds_mv a ${whereClause} ORDER BY a."gender";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ year: number }[]>(
      `SELECT DISTINCT a."year" FROM (SELECT * FROM accuseds_mv ${whereClause}) a WHERE a."year" IS NOT NULL ORDER BY a."year";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ presentStateUt: string }[]>(
      `SELECT DISTINCT a."presentStateUt" from accuseds_mv a ${whereClause} ORDER BY a."presentStateUt";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ nationality: string }[]>(
      `SELECT DISTINCT a."nationality" from accuseds_mv a ${whereClause} ORDER BY a."nationality";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ unit: string }[]>(
      `SELECT DISTINCT a."unit" from accuseds_mv a ${whereClause} ORDER BY a."unit";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ drugType: string[] }[]>(
      `SELECT DISTINCT ON (LOWER(val)) val AS "drugType" FROM (SELECT * FROM accuseds_mv ${whereClause}) a CROSS JOIN LATERAL unnest(a."drugType") AS t(val) WHERE a."drugType" IS NOT NULL ORDER BY LOWER(val), val;`,
      ...params
    ),
  ]);

  return {
    years: years.map(year => year.year).filter(y => y !== null),
    units: units.map(unit => unit.unit).filter(u => !!u),
    caseClass: caseClass.map(caseClass => caseClass.caseClassification).filter(c => !!c),
    caseStatus: caseStatus.map(caseStatus => caseStatus.caseStatus).filter(s => !!s),
    accusedStatus: accusedStatus.map(accusedStatus => accusedStatus.accusedStatus).filter(s => !!s),
    accusedType: accusedType.map(accusedType => accusedType.accusedType).filter(t => !!t),
    domicile: domicile.map(domicile => domicile.domicile).filter(d => !!d),
    ps: ps.map(ps => ps.ps).filter(p => !!p),
    gender: gender.map(gender => gender.gender).filter(g => !!g),
    nationality: nationality.map(nationality => nationality.nationality).filter(n => !!n),
    state: state.map(state => state.presentStateUt).filter(s => !!s),
    drugTypes: [
      { categoryName: 'All Drugs', drugs: Array.from(new Set(drugTypes.flatMap(drugType => drugType.drugType))) },
    ],
  };
}

type YearData = {
  totalCases: number;
  totalInvolved: number;
  totalArrested: number;
  totalAbsconding: number;
};

type YearTotalEntry = {
  year: string;
  totalCases: number;
  totalInvolved: number;
  totalArrested: number;
  totalAbsconding: number;
};

type Row = {
  id: string;
  name: string;
  type: 'unit' | 'station';
  children?: Row[];
  totalsByYear: YearTotalEntry[];
  grandTotals: YearData;
};

type AccusedStatsResponse = {
  years: string[];
  units: Row[];
};

export async function getAccusedAbstract(filters: AccusedFilterInput = {}): Promise<AccusedStatsResponse> {
  const { whereClause, params } = buildFilters(filters);

  // UPDATED: query accuseds_mv directly using normalized "accusedStatus" values
  // instead of firs_mv + JSONB unnesting with ILIKE patterns.
  // totalCases uses COUNT(DISTINCT "crimeId") since accuseds_mv has one row per accused.
  const aggregatedData = await prisma.$queryRawUnsafe<
    {
      unit: string;
      ps: string;
      year: string;
      totalCases: number;
      totalInvolved: number;
      totalArrested: number;
      totalAbsconding: number;
    }[]
  >(
    `
    SELECT 
      COALESCE(unit, 'Unknown Unit') AS unit,
      COALESCE(ps, 'Unknown PS') AS ps,
      COALESCE(year::text, 'Unknown Year') AS year,
      COUNT(DISTINCT "crimeId")::int AS "totalCases",
      COUNT(*)::int AS "totalInvolved",
      COALESCE(SUM(CASE WHEN "accusedStatus" = 'Arrested' THEN 1 ELSE 0 END), 0)::int AS "totalArrested",
      COALESCE(SUM(CASE WHEN "accusedStatus" = 'Absconding' THEN 1 ELSE 0 END), 0)::int AS "totalAbsconding"
    FROM accuseds_mv
    ${whereClause}
    GROUP BY unit, ps, year
    ORDER BY unit, ps, year;
    `,
    ...params
  );

  // Build data structures efficiently
  const yearSet = new Set<string>();
  const unitMap = new Map<
    string,
    {
      unitName: string;
      unitIndex: number;
      stations: Map<
        string,
        {
          psName: string;
          stationIndex: number;
          yearData: Map<string, YearData>;
          totals: YearData;
        }
      >;
      unitYearTotals: Map<string, YearData>;
      unitTotals: YearData;
    }
  >();

  let globalUnitIndex = 0;

  // Single pass through aggregated data
  for (const row of aggregatedData) {
    yearSet.add(row.year);

    // Get or create unit
    if (!unitMap.has(row.unit)) {
      unitMap.set(row.unit, {
        unitName: row.unit,
        unitIndex: globalUnitIndex++,
        stations: new Map(),
        unitYearTotals: new Map(),
        unitTotals: { totalCases: 0, totalInvolved: 0, totalArrested: 0, totalAbsconding: 0 },
      });
    }
    const unit = unitMap.get(row.unit)!;

    // Get or create police station
    if (!unit.stations.has(row.ps)) {
      unit.stations.set(row.ps, {
        psName: row.ps,
        stationIndex: unit.stations.size,
        yearData: new Map(),
        totals: { totalCases: 0, totalInvolved: 0, totalArrested: 0, totalAbsconding: 0 },
      });
    }
    const station = unit.stations.get(row.ps)!;

    // Store year data for station
    station.yearData.set(row.year, {
      totalCases: row.totalCases,
      totalInvolved: row.totalInvolved,
      totalArrested: row.totalArrested,
      totalAbsconding: row.totalAbsconding,
    });

    // Update station totals
    station.totals.totalCases += row.totalCases;
    station.totals.totalInvolved += row.totalInvolved;
    station.totals.totalArrested += row.totalArrested;
    station.totals.totalAbsconding += row.totalAbsconding;

    // Update unit year totals
    if (!unit.unitYearTotals.has(row.year)) {
      unit.unitYearTotals.set(row.year, {
        totalCases: 0,
        totalInvolved: 0,
        totalArrested: 0,
        totalAbsconding: 0,
      });
    }
    const unitYearTotal = unit.unitYearTotals.get(row.year)!;
    unitYearTotal.totalCases += row.totalCases;
    unitYearTotal.totalInvolved += row.totalInvolved;
    unitYearTotal.totalArrested += row.totalArrested;
    unitYearTotal.totalAbsconding += row.totalAbsconding;

    // Update unit totals
    unit.unitTotals.totalCases += row.totalCases;
    unit.unitTotals.totalInvolved += row.totalInvolved;
    unit.unitTotals.totalArrested += row.totalArrested;
    unit.unitTotals.totalAbsconding += row.totalAbsconding;
  }

  // Transform to output format
  const years = Array.from(yearSet).sort();
  const units: Row[] = [];
  const summaryTotalsByYear = new Map<string, YearData>();
  const summaryGrandTotals: YearData = {
    totalCases: 0,
    totalInvolved: 0,
    totalArrested: 0,
    totalAbsconding: 0,
  };

  // Initialize summary year buckets
  years.forEach(y => {
    summaryTotalsByYear.set(y, {
      totalCases: 0,
      totalInvolved: 0,
      totalArrested: 0,
      totalAbsconding: 0,
    });
  });

  // Build unit rows
  for (const unit of unitMap.values()) {
    const stations: Row[] = [];

    // Build station rows
    for (const station of unit.stations.values()) {
      const stationTotalsByYearArray: YearTotalEntry[] = [];
      for (const [year, data] of station.yearData.entries()) {
        stationTotalsByYearArray.push({ year, ...data });
      }

      stations.push({
        id: `${station.psName}--${station.stationIndex}--${unit.unitIndex}`,
        name: station.psName,
        type: 'station',
        totalsByYear: stationTotalsByYearArray,
        grandTotals: station.totals,
      });
    }

    // Build unit year totals array
    const unitYearTotalsArray: YearTotalEntry[] = [];
    for (const [year, data] of unit.unitYearTotals.entries()) {
      unitYearTotalsArray.push({ year, ...data });

      // Aggregate into summary
      const summaryYear = summaryTotalsByYear.get(year)!;
      summaryYear.totalCases += data.totalCases;
      summaryYear.totalInvolved += data.totalInvolved;
      summaryYear.totalArrested += data.totalArrested;
      summaryYear.totalAbsconding += data.totalAbsconding;
    }

    // Add unit row
    units.push({
      id: `${unit.unitName}--${unit.unitIndex}`,
      name: unit.unitName,
      type: 'unit',
      children: stations,
      totalsByYear: unitYearTotalsArray,
      grandTotals: unit.unitTotals,
    });

    // Aggregate into summary grand totals
    summaryGrandTotals.totalCases += unit.unitTotals.totalCases;
    summaryGrandTotals.totalInvolved += unit.unitTotals.totalInvolved;
    summaryGrandTotals.totalArrested += unit.unitTotals.totalArrested;
    summaryGrandTotals.totalAbsconding += unit.unitTotals.totalAbsconding;
  }

  // Sort units by totalCases in descending order
  units.sort((a, b) => (b.grandTotals?.totalCases ?? 0) - (a.grandTotals?.totalCases ?? 0));

  // Build summary row
  const summaryTotalsByYearArray: YearTotalEntry[] = [];
  for (const [year, data] of summaryTotalsByYear.entries()) {
    summaryTotalsByYearArray.push({ year, ...data });
  }

  units.push({
    id: 'grand-summary',
    name: 'Total',
    type: 'unit',
    totalsByYear: summaryTotalsByYearArray,
    grandTotals: summaryGrandTotals,
  });

  return { years, units };
}
