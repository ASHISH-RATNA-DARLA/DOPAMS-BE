import { Firs, Prisma } from '@prisma/client';
import { prisma } from 'datasources/prisma';

import { FirFilterInput } from 'interfaces/fir';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';
import ResourceNotFoundException from 'utils/errors/resource-not-found';
import { FileUpload } from 'graphql-upload-ts';
import { processFileUploadToTomcat } from 'utils/misc';

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
  sortKey: keyof Prisma.FirsOrderByWithRelationInput = 'crimeRegDate',
  sortOrder: Prisma.SortOrder = 'desc'
) {
  const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${sortKey}" ${safeSortOrder} NULLS LAST`;
}

export function buildFilters(filters: FirFilterInput = {}) {
  const clauses: string[] = [];
  const params: any[] = [];

  function addLike(column: string, value: string) {
    params.push(`%${value.trim()}%`);
    clauses.push(`${column} ILIKE $${params.length}`);
  }

  function addArrayLike(column: string, value: any[]) {
    const regexValues = value.map(v => `\\m${v.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\M`);
    params.push(regexValues);
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM unnest($${params.length}::text[]) AS re(val)
        WHERE "${column}" ~* val
      )
    `);
  }

  const firNumber = filters.firNumber?.trim();
  if (firNumber && firNumber.length) addLike('"firNumber"', firNumber);

  const crimeType = filters.crimeType?.trim();
  if (crimeType && crimeType.length) addLike('"crimeType"', crimeType);

  const units = filters.units;
  if (units && units.length) addArrayLike('unit', units);

  const psName = filters.psName;
  if (psName && psName.length) addArrayLike('ps', psName);

  const caseClass = filters.caseClass;
  if (caseClass && caseClass.length) addArrayLike('caseClassification', caseClass);

  const caseStatus = filters.caseStatus;
  if (caseStatus && caseStatus.length) addArrayLike('caseStatus', caseStatus);

  const name = filters.name?.trim();
  if (name && name.length) {
    params.push(`%${name}%`);
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements("accusedDetails") AS accused
        WHERE (accused->>'alias' ILIKE $${params.length})
            OR (accused->>'emailId' ILIKE $${params.length})
            OR (accused->>'fullName' ILIKE $${params.length})
            OR (accused->>'name' ILIKE $${params.length})
            OR (accused->>'surname' ILIKE $${params.length})
      )
    `);
  }

  const relativeName = filters.relativeName?.trim();
  if (relativeName && relativeName.length) {
    params.push(`%${relativeName}%`);
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements("accusedDetails") AS accused
        WHERE (accused->>'relativeName' ILIKE $${params.length})
      )
    `);
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

  const { from: fQR, to: tQR } = filters.drugQuantityRange || {};
  if (fQR != null || tQR != null) {
    params.push(fQR ?? null);
    params.push(tQR ?? null);
    clauses.push(`
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements("drugWithQuantity") AS elem
            WHERE (
                (elem->>'quantityKg')::numeric IS NOT NULL
                AND (
                    ($${params.length - 1}::numeric IS NULL OR (elem->>'quantityKg')::numeric >= $${params.length - 1})
                    AND ($${params.length}::numeric IS NULL OR (elem->>'quantityKg')::numeric <= $${params.length})
                )
            ) OR (
                (elem->>'quantityMl')::numeric IS NOT NULL
                AND (
                    ($${params.length - 1}::numeric IS NULL OR (elem->>'quantityMl')::numeric >= $${params.length - 1})
                    AND ($${params.length}::numeric IS NULL OR (elem->>'quantityMl')::numeric <= $${params.length})
                )
            ) OR (
                (elem->>'quantityCount')::numeric IS NOT NULL
                AND (
                    ($${params.length - 1}::numeric IS NULL OR (elem->>'quantityCount')::numeric >= $${params.length - 1})
                    AND ($${params.length}::numeric IS NULL OR (elem->>'quantityCount')::numeric <= $${params.length})
                )
            )
        )
    `);
  }

  const { from: fWR, to: tWR } = filters.drugWorthRange || {};
  if (fWR != null || tWR != null) {
    params.push(fWR ?? null);
    params.push(tWR ?? null);
    clauses.push(`
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements("drugWithQuantity") AS elem
            WHERE
                (elem->>'worth')::numeric IS NOT NULL
                AND (
                    ($${params.length - 1}::numeric IS NULL OR (elem->>'worth')::numeric >= $${params.length - 1})
                    AND ($${params.length}::numeric IS NULL OR (elem->>'worth')::numeric <= $${params.length})
                )
        )
    `);
  }

  const domicile = filters.domicile;
  if (domicile && Object.keys(domicile).length > 0) {
    const clausesForDomicile: string[] = [];

    Object.entries(domicile).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.push(`%${value}%`);
        const paramIndex = params.length;
        clausesForDomicile.push(`elem->>'${key}' ILIKE $${paramIndex}`);
      }
    });

    if (clausesForDomicile.length > 0) {
      clauses.push(`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements("accusedDetails") AS elem
        WHERE ${clausesForDomicile.join(' AND ')}
      )
    `);
    }
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

  // ---------- Year Filters ----------
  const yearConditions: string[] = [];
  const { from, to } = filters.dateRange || {};
  const validYears = (filters.years || []).filter(y => Number.isInteger(y));

  // Year range
  if (from !== undefined && to !== undefined && from <= to) {
    params.push(from, to);
    yearConditions.push(`"crimeRegDate"::date BETWEEN $${params.length - 1}::date AND $${params.length}::date`);
  } else if (from !== undefined) {
    params.push(from);
    yearConditions.push(`"crimeRegDate"::date >= $${params.length}::date`);
  } else if (to !== undefined) {
    params.push(to);
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

  // ---------- Final where clause ----------
  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  return { whereClause, params };
}

export async function getFir(id: string) {
  const result = await prisma.$queryRawUnsafe<Firs[]>(`SELECT * FROM firs_mv WHERE id = $1 LIMIT 1;`, id);
  const fir = result[0];

  if (!fir) throw new ResourceNotFoundException('FIR Not Found');
  return fir;
}

export async function getFirs(
  page: number = 1,
  limit: number = 100,
  sortKey: keyof Prisma.FirsOrderByWithRelationInput = 'crimeRegDate',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: FirFilterInput = {}
) {
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);

  const [nodes, totalCount] = await Promise.all([
    prisma.$queryRawUnsafe<Firs[]>(
      `SELECT * from firs_mv ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: BigInt }[]>(`SELECT COUNT(*) from firs_mv ${whereClause};`, ...params),
  ]);

  const pageInfo = buildPageInfo(page, limit, totalCount[0].count);

  return { nodes, pageInfo };
}

export async function getFirStatistics(filters: FirFilterInput = {}) {
  const { whereClause: where, params } = buildFilters(filters);
  const totalCrimes = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM firs_mv ${where};`,
    ...params
  );

  const totalFirs = totalCrimes[0].count;
  if (totalFirs === 0) {
    return {
      totalFirs,
      firStatisticsBreakdownByCaseClassUI: [],
      firStatisticsBreakdownByCaseClassPT: [],
      firStatisticsBreakdownByCaseStatus: [],
      firStatisticsBreakdownByCrimeType: [],
    };
  }

  // Run 4 groupBy queries in parallel for performance
  const [caseStatusWise, caseClassWiseUI, caseClassWisePT, crimeTypeWise] = await Promise.all([
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        WITH mapped_statuses AS (
          SELECT
            CASE
              WHEN UPPER(TRIM(f."caseStatus")) = 'UNKNOWN' THEN 'Unknown'
              WHEN UPPER(TRIM(f."caseStatus")) IN ('UI', 'UNDER INVESTIGATION') THEN 'UI'
              WHEN UPPER(TRIM(f."caseStatus")) IN ('CHARGESHEETED', 'CHARGESHEET CREATED') THEN 'Chargesheeted'
              WHEN UPPER(TRIM(f."caseStatus")) IN ('PT', 'PENDING TRIAL') THEN 'PT'
              WHEN UPPER(TRIM(f."caseStatus")) = 'CONVICTION' THEN 'Conviction'
              WHEN UPPER(TRIM(f."caseStatus")) = 'ACQUITTAL' THEN 'Acquittal'
              WHEN UPPER(TRIM(f."caseStatus")) IN ('COMPOUNDED', 'COMPROMISED') THEN 'Compounded'
              WHEN UPPER(TRIM(f."caseStatus")) IN ('ABATED', 'UNDETECTED', 'ACTION DROPPED', 'MISTAKE OF FACT', 'ACTION ABATED', 'LACK OF EVIDENCE', 'MISTAKE OF LAW') THEN 'Police Disposal'
              ELSE 'Other Disposals'
            END AS "mappedLabel"
          FROM firs_mv f
          ${where}
        )
        SELECT
          ms."mappedLabel" AS "label",
          COUNT(*)::int AS "count"
        FROM mapped_statuses ms
        GROUP BY ms."mappedLabel"
        ORDER BY CASE ms."mappedLabel"
          WHEN 'UI' THEN 1
          WHEN 'Chargesheeted' THEN 2
          WHEN 'PT' THEN 3
          WHEN 'Conviction' THEN 4
          WHEN 'Acquittal' THEN 5
          WHEN 'Compounded' THEN 6
          WHEN 'Police Disposal' THEN 7
          WHEN 'Other Disposals' THEN 8
          WHEN 'Unknown' THEN 9
          ELSE 10
        END;
    `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT 
          "caseClassification" AS label, 
          COUNT(*)::int AS count
        FROM firs_mv
        ${where} ${where ? 'AND' : 'WHERE'} UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION')
        GROUP BY "caseClassification"
        ORDER BY CASE "caseClassification"
          WHEN 'Commercial' THEN 1
          WHEN 'Intermediate' THEN 2
          WHEN 'Small' THEN 3
          WHEN 'Cultivation' THEN 4
          WHEN 'Unknown' THEN 5
          ELSE 6
        END;
    `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT 
          "caseClassification" AS label, 
          COUNT(*)::int AS count
        FROM firs_mv
        ${where} ${where ? 'AND' : 'WHERE'} UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL')
        GROUP BY "caseClassification"
        ORDER BY CASE "caseClassification"
          WHEN 'Commercial' THEN 1
          WHEN 'Intermediate' THEN 2
          WHEN 'Small' THEN 3
          WHEN 'Cultivation' THEN 4
          WHEN 'Unknown' THEN 5
          ELSE 6
        END;
    `,
      ...params
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT COALESCE(NULLIF(TRIM(f."crimeType"), ''), 'Unknown') AS "label", COUNT(*)::int AS "count"
        FROM firs_mv f
        ${where}
        GROUP BY COALESCE(NULLIF(TRIM(f."crimeType"), ''), 'Unknown')
        ORDER BY COUNT(*) DESC;
    `,
      ...params
    ),
  ]);

  return {
    totalFirs,
    firStatisticsBreakdownByCaseClassUI: caseClassWiseUI,
    firStatisticsBreakdownByCaseClassPT: caseClassWisePT,
    firStatisticsBreakdownByCaseStatus: caseStatusWise,
    firStatisticsBreakdownByCrimeType: crimeTypeWise,
  };
}

export async function getFirFilterValues(filters: FirFilterInput = {}) {
  const { whereClause, params } = buildFilters(filters);

  const [caseClass, caseStatus, ps, years, units, drugTypes] = await Promise.all([
    prisma.$queryRawUnsafe<{ caseClassification: number }[]>(
      `SELECT DISTINCT f."caseClassification" from firs_mv f ${whereClause} ORDER BY f."caseClassification";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ caseStatus: number }[]>(
      `SELECT DISTINCT f."caseStatus" from firs_mv f ${whereClause} ORDER BY f."caseStatus";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ ps: number }[]>(
      `SELECT DISTINCT f."ps" from firs_mv f ${whereClause} ORDER BY f."ps";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ year: number }[]>(
      `SELECT DISTINCT f."year" from firs_mv f ${whereClause} ${whereClause.length ? 'AND' : 'WHERE'} f."year" IS NOT NULL ORDER BY f."year";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ unit: string }[]>(
      `SELECT DISTINCT f."unit" from firs_mv f ${whereClause} ORDER BY f."unit";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ drugType: string[] }[]>(
      `SELECT DISTINCT ON (LOWER(val)) val AS "drugType" FROM firs_mv f CROSS JOIN LATERAL unnest(f."drugType") AS t(val) ${whereClause} ${whereClause.length ? 'AND' : 'WHERE'} f."drugType" IS NOT NULL ORDER BY LOWER(val), val;`,
      ...params
    ),
  ]);

  return {
    caseClass: caseClass.map(caseClass => caseClass.caseClassification),
    caseStatus: caseStatus.map(caseStatus => caseStatus.caseStatus),
    ps: ps.map(ps => ps.ps),
    years: years.map(year => year.year),
    units: units.map(unit => unit.unit),
    drugTypes: Array.from(new Set(drugTypes.flatMap(drugType => drugType.drugType))),
  };
}

type PsRecord = {
  psName: string;
  crimes: number;
};

type UnitRecord = {
  unitName: string; // hierarchy.dist_name
  ps: PsRecord[]; // array of PS records for this unit
  totalCrimes: number; // sum of crimes for all PS in this unit
};

type CrimeStatsOutput = {
  totalCrimes: number; // global distinct fir_num count (after filters)
  mostCrimesPsName: string; // PS name with highest crimes
  leastCrimesPsName: string; // PS name with lowest crimes
  units: UnitRecord[]; // flattened per-unit data
};

export async function getUiPtCasesStatistics(
  caseStatus: string,
  years: number[] | undefined,
  drugTypes: string[] | undefined
): Promise<CrimeStatsOutput> {
  // fetch all necessary data joined properly
  const { whereClause, params } = buildFilters({ caseStatus: [caseStatus], years, drugTypes });
  const rows = await prisma.$queryRawUnsafe<Firs[]>(`SELECT * from firs_mv ${whereClause};`, ...params);

  // Initialize maps
  const psCounts = new Map<string, number>(); // ps_name -> count
  const distToPsCounts = new Map<string, Map<string, number>>(); // dist_name -> (ps_name -> count)
  let totalCrimes = 0;

  for (const row of rows) {
    const psName = row.ps ?? 'UNKNOWN_PS';
    const distName = row.unit ?? 'UNKNOWN_UNIT';

    // Increment total count
    totalCrimes += 1;

    // Increment PS count
    psCounts.set(psName, (psCounts.get(psName) ?? 0) + 1);

    // Increment district → PS count
    if (!distToPsCounts.has(distName)) distToPsCounts.set(distName, new Map());
    const psMap = distToPsCounts.get(distName)!;
    psMap.set(psName, (psMap.get(psName) ?? 0) + 1);
  }

  // Determine most and least crimes PS names
  let mostCrimesPsName = '';
  let leastCrimesPsName = '';

  if (psCounts.size > 0) {
    let maxCount = -Infinity;
    let minCount = Infinity;

    for (const [psName, count] of psCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCrimesPsName = psName;
      }
      if (count < minCount) {
        minCount = count;
        leastCrimesPsName = psName;
      }
    }
  }

  // Build final units array
  const units: UnitRecord[] = [];

  for (const [distName, psMap] of distToPsCounts.entries()) {
    const psArray: PsRecord[] = [];
    let unitTotal = 0;

    for (const [psName, count] of psMap.entries()) {
      psArray.push({ psName, crimes: count });
      unitTotal += count;
    }

    units.push({
      unitName: distName,
      ps: psArray,
      totalCrimes: unitTotal,
    });
  }

  return {
    totalCrimes,
    mostCrimesPsName,
    leastCrimesPsName,
    units,
  };
}

type YearData = {
  // Case status based counts
  underInvestigation: number;
  pendingInTrial: number;
  disposed: number;
  others: number;
  acquittal: number;
  conviction: number;
  chargesheeted: number;

  // UI quantities by case classification
  uiCommercialQuantity: number;
  uiIntermediateQuantity: number;
  uiSmallQuantity: number;
  uiCultivation: number;

  // PT quantities by case classification
  ptSmallQuantity: number;
  ptIntermediateQuantity: number;
  ptCommercialQuantity: number;
  ptCultivation: number;

  // Independent total count of FIRs for the given year / bucket
  total: number;
};

type YearTotalEntry = {
  year: string;
} & YearData;

type Row = {
  id: string;
  name: string;
  type: 'unit' | 'station';
  children?: Row[];
  totalsByYear: YearTotalEntry[];
  grandTotals: YearData;
};

type CrimeStatsResponse = {
  years: string[];
  units: Row[];
};

export async function getFirsAbstract(filters: FirFilterInput = {}): Promise<CrimeStatsResponse> {
  const { whereClause, params } = buildFilters(filters);

  // Optimized: Use PostgreSQL aggregation at unit+ps+year level
  const aggregatedData = await prisma.$queryRawUnsafe<
    {
      unit: string;
      ps: string;
      year: string;
      underInvestigation: number;
      pendingInTrial: number;
      disposed: number;
      others: number;
      acquittal: number;
      conviction: number;
      chargesheeted: number;
      uiCommercialQuantity: number;
      uiIntermediateQuantity: number;
      uiSmallQuantity: number;
      uiCultivation: number;
      ptSmallQuantity: number;
      ptIntermediateQuantity: number;
      ptCommercialQuantity: number;
      ptCultivation: number;
      total: number;
    }[]
  >(
    `
    SELECT 
      COALESCE(unit, 'Unknown Unit') AS unit,
      COALESCE(ps, 'Unknown PS') AS ps,
      COALESCE(year::text, 'Unknown Year') AS year,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION'))::int AS "underInvestigation",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL'))::int AS "pendingInTrial",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('CHARGESHEETED', 'CHARGESHEET CREATED'))::int AS chargesheeted,
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) = 'DISPOSED')::int AS disposed,
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) = 'ACQUITTAL')::int AS acquittal,
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) = 'CONVICTION')::int AS conviction,
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION') AND UPPER(TRIM("caseClassification")) = 'COMMERCIAL')::int AS "uiCommercialQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION') AND UPPER(TRIM("caseClassification")) = 'INTERMEDIATE')::int AS "uiIntermediateQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION') AND UPPER(TRIM("caseClassification")) = 'SMALL')::int AS "uiSmallQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('UI', 'UNDER INVESTIGATION') AND UPPER(TRIM("caseClassification")) = 'CULTIVATION')::int AS "uiCultivation",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL') AND UPPER(TRIM("caseClassification")) = 'SMALL')::int AS "ptSmallQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL') AND UPPER(TRIM("caseClassification")) = 'INTERMEDIATE')::int AS "ptIntermediateQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL') AND UPPER(TRIM("caseClassification")) = 'COMMERCIAL')::int AS "ptCommercialQuantity",
      COUNT(*) FILTER (WHERE UPPER(TRIM("caseStatus")) IN ('PT', 'PENDING TRIAL') AND UPPER(TRIM("caseClassification")) = 'CULTIVATION')::int AS "ptCultivation"
    FROM firs_mv
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
        unitTotals: {
          underInvestigation: 0,
          pendingInTrial: 0,
          disposed: 0,
          others: 0,
          acquittal: 0,
          conviction: 0,
          chargesheeted: 0,
          uiCommercialQuantity: 0,
          uiIntermediateQuantity: 0,
          uiSmallQuantity: 0,
          uiCultivation: 0,
          ptSmallQuantity: 0,
          ptIntermediateQuantity: 0,
          ptCommercialQuantity: 0,
          ptCultivation: 0,
          total: 0,
        },
      });
    }
    const unit = unitMap.get(row.unit)!;

    // Get or create police station
    if (!unit.stations.has(row.ps)) {
      unit.stations.set(row.ps, {
        psName: row.ps,
        stationIndex: unit.stations.size,
        yearData: new Map(),
        totals: {
          underInvestigation: 0,
          pendingInTrial: 0,
          disposed: 0,
          others: 0,
          acquittal: 0,
          conviction: 0,
          chargesheeted: 0,
          uiCommercialQuantity: 0,
          uiIntermediateQuantity: 0,
          uiSmallQuantity: 0,
          uiCultivation: 0,
          ptSmallQuantity: 0,
          ptIntermediateQuantity: 0,
          ptCommercialQuantity: 0,
          ptCultivation: 0,
          total: 0,
        },
      });
    }
    const station = unit.stations.get(row.ps)!;

    // Store year data for station
    const yearData: YearData = {
      underInvestigation: row.underInvestigation,
      pendingInTrial: row.pendingInTrial,
      disposed: row.disposed,
      others: row.others,
      acquittal: row.acquittal,
      conviction: row.conviction,
      chargesheeted: row.chargesheeted,
      uiCommercialQuantity: row.uiCommercialQuantity,
      uiIntermediateQuantity: row.uiIntermediateQuantity,
      uiSmallQuantity: row.uiSmallQuantity,
      uiCultivation: row.uiCultivation,
      ptSmallQuantity: row.ptSmallQuantity,
      ptIntermediateQuantity: row.ptIntermediateQuantity,
      ptCommercialQuantity: row.ptCommercialQuantity,
      ptCultivation: row.ptCultivation,
      total: row.total,
    };
    station.yearData.set(row.year, yearData);

    // Update station totals
    station.totals.underInvestigation += row.underInvestigation;
    station.totals.pendingInTrial += row.pendingInTrial;
    station.totals.disposed += row.disposed;
    station.totals.others += row.others;
    station.totals.acquittal += row.acquittal;
    station.totals.conviction += row.conviction;
    station.totals.chargesheeted += row.chargesheeted;
    station.totals.uiCommercialQuantity += row.uiCommercialQuantity;
    station.totals.uiIntermediateQuantity += row.uiIntermediateQuantity;
    station.totals.uiSmallQuantity += row.uiSmallQuantity;
    station.totals.uiCultivation += row.uiCultivation;
    station.totals.ptSmallQuantity += row.ptSmallQuantity;
    station.totals.ptIntermediateQuantity += row.ptIntermediateQuantity;
    station.totals.ptCommercialQuantity += row.ptCommercialQuantity;
    station.totals.ptCultivation += row.ptCultivation;
    station.totals.total += row.total;

    // Update unit year totals
    if (!unit.unitYearTotals.has(row.year)) {
      unit.unitYearTotals.set(row.year, {
        underInvestigation: 0,
        pendingInTrial: 0,
        disposed: 0,
        others: 0,
        acquittal: 0,
        conviction: 0,
        chargesheeted: 0,
        uiCommercialQuantity: 0,
        uiIntermediateQuantity: 0,
        uiSmallQuantity: 0,
        uiCultivation: 0,
        ptSmallQuantity: 0,
        ptIntermediateQuantity: 0,
        ptCommercialQuantity: 0,
        ptCultivation: 0,
        total: 0,
      });
    }
    const unitYearTotal = unit.unitYearTotals.get(row.year)!;
    unitYearTotal.underInvestigation += row.underInvestigation;
    unitYearTotal.pendingInTrial += row.pendingInTrial;
    unitYearTotal.disposed += row.disposed;
    unitYearTotal.others += row.others;
    unitYearTotal.acquittal += row.acquittal;
    unitYearTotal.conviction += row.conviction;
    unitYearTotal.chargesheeted += row.chargesheeted;
    unitYearTotal.uiCommercialQuantity += row.uiCommercialQuantity;
    unitYearTotal.uiIntermediateQuantity += row.uiIntermediateQuantity;
    unitYearTotal.uiSmallQuantity += row.uiSmallQuantity;
    unitYearTotal.uiCultivation += row.uiCultivation;
    unitYearTotal.ptSmallQuantity += row.ptSmallQuantity;
    unitYearTotal.ptIntermediateQuantity += row.ptIntermediateQuantity;
    unitYearTotal.ptCommercialQuantity += row.ptCommercialQuantity;
    unitYearTotal.ptCultivation += row.ptCultivation;
    unitYearTotal.total += row.total;

    // Update unit totals
    unit.unitTotals.underInvestigation += row.underInvestigation;
    unit.unitTotals.pendingInTrial += row.pendingInTrial;
    unit.unitTotals.disposed += row.disposed;
    unit.unitTotals.others += row.others;
    unit.unitTotals.acquittal += row.acquittal;
    unit.unitTotals.conviction += row.conviction;
    unit.unitTotals.chargesheeted += row.chargesheeted;
    unit.unitTotals.uiCommercialQuantity += row.uiCommercialQuantity;
    unit.unitTotals.uiIntermediateQuantity += row.uiIntermediateQuantity;
    unit.unitTotals.uiSmallQuantity += row.uiSmallQuantity;
    unit.unitTotals.uiCultivation += row.uiCultivation;
    unit.unitTotals.ptSmallQuantity += row.ptSmallQuantity;
    unit.unitTotals.ptIntermediateQuantity += row.ptIntermediateQuantity;
    unit.unitTotals.ptCommercialQuantity += row.ptCommercialQuantity;
    unit.unitTotals.ptCultivation += row.ptCultivation;
    unit.unitTotals.total += row.total;
  }

  // Transform to output format
  const years = Array.from(yearSet).sort();
  const units: Row[] = [];
  const summaryTotalsByYear = new Map<string, YearData>();
  const summaryGrandTotals: YearData = {
    underInvestigation: 0,
    pendingInTrial: 0,
    disposed: 0,
    others: 0,
    acquittal: 0,
    conviction: 0,
    chargesheeted: 0,
    uiCommercialQuantity: 0,
    uiIntermediateQuantity: 0,
    uiSmallQuantity: 0,
    uiCultivation: 0,
    ptSmallQuantity: 0,
    ptIntermediateQuantity: 0,
    ptCommercialQuantity: 0,
    ptCultivation: 0,
    total: 0,
  };

  // Initialize summary year buckets
  years.forEach(y => {
    summaryTotalsByYear.set(y, {
      underInvestigation: 0,
      pendingInTrial: 0,
      disposed: 0,
      others: 0,
      acquittal: 0,
      conviction: 0,
      chargesheeted: 0,
      uiCommercialQuantity: 0,
      uiIntermediateQuantity: 0,
      uiSmallQuantity: 0,
      uiCultivation: 0,
      ptSmallQuantity: 0,
      ptIntermediateQuantity: 0,
      ptCommercialQuantity: 0,
      ptCultivation: 0,
      total: 0,
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
      summaryYear.underInvestigation += data.underInvestigation;
      summaryYear.pendingInTrial += data.pendingInTrial;
      summaryYear.disposed += data.disposed;
      summaryYear.others += data.others;
      summaryYear.acquittal += data.acquittal;
      summaryYear.conviction += data.conviction;
      summaryYear.chargesheeted += data.chargesheeted;
      summaryYear.uiCommercialQuantity += data.uiCommercialQuantity;
      summaryYear.uiIntermediateQuantity += data.uiIntermediateQuantity;
      summaryYear.uiSmallQuantity += data.uiSmallQuantity;
      summaryYear.uiCultivation += data.uiCultivation;
      summaryYear.ptSmallQuantity += data.ptSmallQuantity;
      summaryYear.ptIntermediateQuantity += data.ptIntermediateQuantity;
      summaryYear.ptCommercialQuantity += data.ptCommercialQuantity;
      summaryYear.ptCultivation += data.ptCultivation;
      summaryYear.total += data.total;
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
    summaryGrandTotals.underInvestigation += unit.unitTotals.underInvestigation;
    summaryGrandTotals.pendingInTrial += unit.unitTotals.pendingInTrial;
    summaryGrandTotals.disposed += unit.unitTotals.disposed;
    summaryGrandTotals.others += unit.unitTotals.others;
    summaryGrandTotals.acquittal += unit.unitTotals.acquittal;
    summaryGrandTotals.conviction += unit.unitTotals.conviction;
    summaryGrandTotals.chargesheeted += unit.unitTotals.chargesheeted;
    summaryGrandTotals.uiCommercialQuantity += unit.unitTotals.uiCommercialQuantity;
    summaryGrandTotals.uiIntermediateQuantity += unit.unitTotals.uiIntermediateQuantity;
    summaryGrandTotals.uiSmallQuantity += unit.unitTotals.uiSmallQuantity;
    summaryGrandTotals.uiCultivation += unit.unitTotals.uiCultivation;
    summaryGrandTotals.ptSmallQuantity += unit.unitTotals.ptSmallQuantity;
    summaryGrandTotals.ptIntermediateQuantity += unit.unitTotals.ptIntermediateQuantity;
    summaryGrandTotals.ptCommercialQuantity += unit.unitTotals.ptCommercialQuantity;
    summaryGrandTotals.ptCultivation += unit.unitTotals.ptCultivation;
    summaryGrandTotals.total += unit.unitTotals.total;
  }

  // Sort units by total cases in descending order
  units.sort((a, b) => (b.grandTotals?.total ?? 0) - (a.grandTotals?.total ?? 0));

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

export async function getOverviewStatistics() {
  const [topPerformingRegions, drugWiseAnalysis, monthlyTrends] = await Promise.all([
    prisma.$queryRawUnsafe<
      {
        unit: string;
        totalFirs: number;
        totalArrests: number;
        totalQuantity: number;
      }[]
    >(`
        SELECT
            f."unit",
            COUNT(*)::int AS "totalFirs",
            SUM(
                (
                    SELECT COUNT(*)::int
                    FROM jsonb_array_elements(f."accusedDetails") AS ad
                    WHERE ad->>'status' = 'arrested'
                )
            )::int AS "totalArrests",
            SUM(
                (
                    SELECT COALESCE(SUM((dd->>'quantity')::numeric), 0)
                    FROM jsonb_array_elements(f."drugWithQuantity") AS dd
                )
            )::int AS "totalQuantity"
        FROM firs_mv f
        WHERE f."year" = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY f."unit"
        ORDER BY "totalFirs" DESC
        LIMIT 10;
    `),
    prisma.$queryRawUnsafe<
      {
        drug: string;
        totalFirs: number;
        totalQuantity: number;
      }[]
    >(`
        SELECT
            t."drug",
            COUNT(DISTINCT t."firId")::int AS "totalFirs",
            SUM(t."quantity")::int AS "totalQuantity"
        FROM (
            SELECT
                f."id" AS "firId",
                (d ->> 'name') AS "drug",
                COALESCE((d ->> 'quantity')::numeric, 0) AS "quantity"
            FROM firs_mv f
            CROSS JOIN LATERAL jsonb_array_elements(f."drugWithQuantity") AS d
            WHERE f."year" = EXTRACT(YEAR FROM CURRENT_DATE)
        ) t
        GROUP BY "drug"
        ORDER BY "totalFirs" DESC
        LIMIT 10;
    `),
    prisma.$queryRawUnsafe<
      {
        month: string;
        totalFirs: number;
        totalArrests: number;
      }[]
    >(`
        SELECT
            to_char(t."month", 'Mon YYYY') AS "month",
            COUNT(*)::int AS "totalFirs",
            SUM(t."arrests")::int AS "totalArrests"
        FROM (
            SELECT
                date_trunc('month', f."crimeRegDate")::date AS "month",
                (
                    SELECT COUNT(*)
                    FROM jsonb_array_elements(f."accusedDetails") AS a
                    WHERE a->>'status' ILIKE 'arrested'
                ) AS "arrests"
            FROM firs_mv f
            WHERE f."year" = EXTRACT(YEAR FROM CURRENT_DATE)
        ) t
        GROUP BY "month"
        ORDER BY "totalFirs" DESC;
    `),
  ]);

  return { topPerformingRegions, drugWiseAnalysis, monthlyTrends };
}

export async function uploadFile(file: FileUpload, firId: string) {
  const { fileName, viewUrl } = await processFileUploadToTomcat(file, `fir-media/${firId}`);
  await prisma.$transaction([
    prisma.$executeRawUnsafe(`ALTER TABLE files DISABLE TRIGGER trigger_auto_generate_file_paths;`),
    prisma.file.create({
      data: {
        parentId: firId,
        sourceField: 'MEDIA',
        sourceType: 'crime',
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
