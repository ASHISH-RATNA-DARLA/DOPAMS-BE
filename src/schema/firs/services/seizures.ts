import { prisma } from 'datasources/prisma';
import { FirFilterInput } from 'interfaces/fir';

import { buildFilters } from '.';

export async function getSeizuresFilterValues(filters: FirFilterInput = {}) {
  const { whereClause, params } = buildFilters(filters);

  // Build drug types query params conditionally
  let drugTypeWhereClause = '';
  const drugTypesQueryParams = [...params];
  if (filters.drugTypes && filters.drugTypes.length > 0) {
    drugTypesQueryParams.push(filters.drugTypes.map(d => d.toLowerCase()));
    drugTypeWhereClause = `AND LOWER(TRIM(primary_drug_name)) = ANY($${drugTypesQueryParams.length}::text[])`;
  }

  const [units, years, drugTypes] = await Promise.all([
    prisma.$queryRawUnsafe<{ unit: string }[]>(
      `SELECT DISTINCT f."unit" from firs_mv f ${whereClause} ORDER BY f."unit";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ year: number }[]>(
      `SELECT DISTINCT f."year" from firs_mv f ${whereClause} ${whereClause.length ? 'AND' : 'WHERE'} f."year" IS NOT NULL ORDER BY f."year";`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ drugType: string }[]>(
      `SELECT DISTINCT 
        CASE 
          WHEN NULLIF(TRIM(primary_drug_name), 'NO_DRUGS_DETECTED') IS NULL THEN 'Unknown'
          ELSE TRIM(primary_drug_name)
        END as "drugType" 
      FROM brief_facts_drug 
      WHERE primary_drug_name IS NOT NULL ${drugTypeWhereClause} 
      ORDER BY "drugType";`,
      ...drugTypesQueryParams
    ),
  ]);

  return {
    units: units.map(unit => unit.unit),
    years: years.map(year => year.year),
    drugTypes: Array.from(new Set(drugTypes.map(drugType => drugType.drugType))),
  };
}

export async function getSeizuresStatistics(filters: FirFilterInput = {}) {
  const { whereClause: where, params } = buildFilters(filters);
  const totalCrimes = await prisma.$queryRawUnsafe<{ count: BigInt }[]>(
    `SELECT COUNT(*) from firs_mv ${where};`,
    ...params
  );

  if (Number(totalCrimes[0].count) === 0) {
    return {
      totalSeizures: 0,
      seizuresStatisticsBreakdownByDrugType: [],
      seizuresStatisticsBreakdownByCaseClass: [],
    };
  }

  // Add drug name filter to only include selected drugs in the output
  let drugNameFilter = '';
  const queryParams = [...params];
  if (filters.drugTypes && filters.drugTypes.length > 0) {
    queryParams.push(filters.drugTypes.map(d => d.toLowerCase()));
    drugNameFilter = `AND LOWER(TRIM(bfd.primary_drug_name)) = ANY($${queryParams.length}::text[])`;
  }

  // Run 3 groupBy queries in parallel for performance
  const [totalSeizures, drugTypeWise, caseClassWise] = await Promise.all([
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT 
         COUNT(DISTINCT crime_id)::int as count
       FROM
         brief_facts_drug bfd
       INNER JOIN firs_mv fmv ON fmv.id = bfd.crime_id
       ${where}
       ${drugNameFilter};`,
      ...queryParams
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        WITH drug_counts AS (
          SELECT
            CASE
              WHEN NULLIF(TRIM(primary_drug_name), 'NO_DRUGS_DETECTED') IS NULL THEN 'Unknown'
              ELSE TRIM(primary_drug_name)
            END AS "label",
            COUNT(DISTINCT crime_id)::int AS "count"
          FROM
            brief_facts_drug bfd
          INNER JOIN firs_mv fmv ON fmv.id = bfd.crime_id
          ${where}
          ${drugNameFilter}
          GROUP BY
            CASE
              WHEN NULLIF(TRIM(primary_drug_name), 'NO_DRUGS_DETECTED') IS NULL THEN 'Unknown'
              ELSE TRIM(primary_drug_name)
            END
        ),
        others_sum AS (
          SELECT
            'Others' AS "label",
            COALESCE(SUM("count"),0)::int AS "count",
            1 AS sort_order
          FROM drug_counts
          WHERE "label" NOT IN ('Unknown') AND "count" < 6
        ),
        main_counts AS (
          SELECT 
            "label", 
            "count",
            CASE
              WHEN "label" = 'Unknown' THEN 2
              ELSE 0
            END AS sort_order
          FROM drug_counts
          WHERE "count" >= 6 OR "label" = 'Unknown'
        )
        SELECT "label", "count", sort_order FROM main_counts
        UNION ALL
        SELECT "label", "count", sort_order FROM others_sum
        WHERE "count" > 0
        ORDER BY sort_order, "count" DESC NULLS LAST;
    `,
      ...queryParams
    ),
    prisma.$queryRawUnsafe<{ label: string; count: number }[]>(
      `
        SELECT
            COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') AS "label",
            COUNT(*)::int AS "count"
        FROM firs_mv f
        ${where}
        GROUP BY "label"
        ORDER BY "count" DESC;
    `,
      ...params
    ),
  ]);

  return {
    totalSeizures: Number(totalSeizures[0].count),
    seizuresStatisticsBreakdownByDrugType: drugTypeWise,
    seizuresStatisticsBreakdownByCaseClass: caseClassWise,
  };
}

type YearData = {
  totalCases: number;
  totalQuantityKg: number;
  totalQuantityMl: number;
  totalQuantityCount: number;
  totalWorth: number;
};

type YearTotalEntry = {
  year: string;
} & YearData;

type Row = {
  id: string;
  name: string;
  totalsByYear: YearTotalEntry[];
  totals: YearData;
};

type SeizuresAbstractResponse = {
  years: string[];
  drugs: Row[];
};

export async function getSeizuresAbstract(filters: FirFilterInput = {}): Promise<SeizuresAbstractResponse> {
  const { whereClause, params } = buildFilters(filters);

  // Add drug name filter to only include selected drugs in the output
  let drugNameFilter = '';
  const queryParams = [...params];
  if (filters.drugTypes && filters.drugTypes.length > 0) {
    queryParams.push(filters.drugTypes.map(d => d.toLowerCase()));
    drugNameFilter = `AND LOWER(TRIM(bfd.primary_drug_name)) = ANY($${queryParams.length}::text[])`;
  }

  // Parallel queries: one for drug-wise breakdown, one for accurate grand summary
  const [aggregatedData, grandSummaryRows] = await Promise.all([
    prisma.$queryRawUnsafe<
      {
        drugName: string;
        year: string;
        totalCases: number;
        totalQuantityKg: string;
        totalQuantityMl: string;
        totalQuantityCount: string;
        totalWorth: string;
      }[]
    >(
      `
        SELECT
          CASE 
            WHEN NULLIF(TRIM(bfd.primary_drug_name), 'NO_DRUGS_DETECTED') IS NULL THEN 'Unknown'
            ELSE TRIM(bfd.primary_drug_name)
          END AS "drugName",
          COALESCE(fmv.year::text, 'Unknown Year') AS year,
          COUNT(DISTINCT bfd.crime_id)::int AS "totalCases",
          COALESCE(ROUND(SUM(bfd.standardized_weight_kg)), 0)::text AS "totalQuantityKg",
          COALESCE(ROUND(SUM(bfd.standardized_volume_ml)), 0)::text AS "totalQuantityMl",
          COALESCE(ROUND(SUM(bfd.standardized_count)), 0)::text AS "totalQuantityCount",
          COALESCE(ROUND(SUM(bfd.seizure_worth * 10000000)), 0)::text AS "totalWorth"
        FROM brief_facts_drug bfd
        INNER JOIN firs_mv fmv ON fmv.id = bfd.crime_id
        ${whereClause}
        ${drugNameFilter}
        GROUP BY "drugName", fmv.year
        ORDER BY "drugName", fmv.year;
    `,
      ...queryParams
    ),
    prisma.$queryRawUnsafe<
      {
        year: string;
        totalCases: number;
        totalQuantityKg: string;
        totalQuantityMl: string;
        totalQuantityCount: string;
        totalWorth: string;
      }[]
    >(
      `
        SELECT
          COALESCE(fmv.year::text, 'Unknown Year') AS year,
          COUNT(DISTINCT bfd.crime_id)::int AS "totalCases",
          COALESCE(ROUND(SUM(bfd.standardized_weight_kg)), 0)::text AS "totalQuantityKg",
          COALESCE(ROUND(SUM(bfd.standardized_volume_ml)), 0)::text AS "totalQuantityMl",
          COALESCE(ROUND(SUM(bfd.standardized_count)), 0)::text AS "totalQuantityCount",
          COALESCE(ROUND(SUM(bfd.seizure_worth * 10000000)), 0)::text AS "totalWorth"
        FROM brief_facts_drug bfd
        INNER JOIN firs_mv fmv ON fmv.id = bfd.crime_id
        ${whereClause}
        ${drugNameFilter}
        GROUP BY year
        ORDER BY year;
    `,
      ...queryParams
    ),
  ]);

  // Build data structures
  const yearSet = new Set<string>();
  const drugMap = new Map<
    string,
    {
      drugName: string;
      drugIndex: number;
      yearData: Map<string, YearData>;
      totals: YearData;
    }
  >();

  let globalDrugIndex = 0;

  // Single pass through aggregated data
  for (const row of aggregatedData) {
    yearSet.add(row.year);

    // Get or create drug
    if (!drugMap.has(row.drugName)) {
      drugMap.set(row.drugName, {
        drugName: row.drugName,
        drugIndex: globalDrugIndex++,
        yearData: new Map(),
        totals: { totalCases: 0, totalQuantityKg: 0, totalQuantityMl: 0, totalQuantityCount: 0, totalWorth: 0 },
      });
    }
    const drug = drugMap.get(row.drugName)!;

    // Store year data
    const yearData: YearData = {
      totalCases: row.totalCases,
      totalQuantityKg: Number(row.totalQuantityKg),
      totalQuantityMl: Number(row.totalQuantityMl),
      totalQuantityCount: Number(row.totalQuantityCount),
      totalWorth: Number(row.totalWorth),
    };
    drug.yearData.set(row.year, yearData);

    // Update drug totals
    drug.totals.totalCases += row.totalCases;
    drug.totals.totalQuantityKg += Number(row.totalQuantityKg);
    drug.totals.totalQuantityMl += Number(row.totalQuantityMl);
    drug.totals.totalQuantityCount += Number(row.totalQuantityCount);
    drug.totals.totalWorth += Number(row.totalWorth);
  }

  // Transform to output format
  const years = Array.from(yearSet).sort();
  const drugs: Row[] = [];
  const summaryTotalsByYear = new Map<string, YearData>();
  const summaryTotals: YearData = {
    totalCases: 0,
    totalQuantityKg: 0,
    totalQuantityMl: 0,
    totalQuantityCount: 0,
    totalWorth: 0,
  };

  // Initialize summary year buckets
  years.forEach(y => {
    summaryTotalsByYear.set(y, {
      totalCases: 0,
      totalQuantityKg: 0,
      totalQuantityMl: 0,
      totalQuantityCount: 0,
      totalWorth: 0,
    });
  });

  // Build drug rows
  for (const drug of drugMap.values()) {
    const totalsByYearArray: YearTotalEntry[] = [];

    for (const [year, data] of drug.yearData.entries()) {
      totalsByYearArray.push({ year, ...data });
    }

    drugs.push({
      id: `${drug.drugName}--${drug.drugIndex}`,
      name: drug.drugName,
      totalsByYear: totalsByYearArray,
      totals: drug.totals,
    });

    // Aggregate into summary totals - Note: These are now superseded by grandSummaryRows for the summary row itself
    summaryTotals.totalCases += drug.totals.totalCases;
    summaryTotals.totalQuantityKg += drug.totals.totalQuantityKg;
    summaryTotals.totalQuantityMl += drug.totals.totalQuantityMl;
    summaryTotals.totalQuantityCount += drug.totals.totalQuantityCount;
    summaryTotals.totalWorth += drug.totals.totalWorth;
  }

  // Populate actual summary totals from the second query to ensure accuracy (unique cases)
  for (const row of grandSummaryRows) {
    const summaryYear = summaryTotalsByYear.get(row.year);
    if (summaryYear) {
      summaryYear.totalCases = row.totalCases;
      summaryYear.totalQuantityKg = Number(row.totalQuantityKg);
      summaryYear.totalQuantityMl = Number(row.totalQuantityMl);
      summaryYear.totalQuantityCount = Number(row.totalQuantityCount);
      summaryYear.totalWorth = Number(row.totalWorth);
    }
  }

  // Recalculate global summary totals from the accurate year-wise summary totals
  summaryTotals.totalCases = 0;
  summaryTotals.totalQuantityKg = 0;
  summaryTotals.totalQuantityMl = 0;
  summaryTotals.totalQuantityCount = 0;
  summaryTotals.totalWorth = 0;

  for (const data of summaryTotalsByYear.values()) {
    summaryTotals.totalCases += data.totalCases;
    summaryTotals.totalQuantityKg += data.totalQuantityKg;
    summaryTotals.totalQuantityMl += data.totalQuantityMl;
    summaryTotals.totalQuantityCount += data.totalQuantityCount;
    summaryTotals.totalWorth += data.totalWorth;
  }

  // Sort drugs alphabetically
  drugs.sort((a, b) => (b.totals?.totalCases ?? 0) - (a.totals?.totalCases ?? 0));

  // Build summary row
  const summaryTotalsByYearArray: YearTotalEntry[] = [];
  for (const [year, data] of summaryTotalsByYear.entries()) {
    summaryTotalsByYearArray.push({ year, ...data });
  }

  drugs.push({
    id: 'grand-summary',
    name: 'Total',
    totalsByYear: summaryTotalsByYearArray,
    totals: summaryTotals,
  });

  return { years, drugs };
}
