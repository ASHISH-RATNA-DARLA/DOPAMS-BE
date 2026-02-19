import { prisma } from 'datasources/prisma';

export function buildDateFilter(from: string | undefined, to: string | undefined) {
  let gte: Date | undefined;
  let lte: Date | undefined;

  // Manual date range logic only
  if (from) gte = new Date(from);
  if (to) {
    lte = new Date(to);
    lte.setHours(23, 59, 59, 999);
  }

  // If neither from/to provided → no filter
  if (!gte && !lte) return undefined;

  const filter: Record<string, Date> = {};
  if (gte) filter.gte = gte;
  if (lte) filter.lte = lte;

  return filter;
}

async function getFirsWithDateFilter(from: string | undefined, to: string | undefined): Promise<{ id: string }[]> {
  const dateFilter = buildDateFilter(from, to);

  if (dateFilter) {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dateFilter.gte) {
      conditions.push(`"crimeRegDate" >= $${paramIndex}::timestamp`);
      params.push(dateFilter.gte.toISOString());
      paramIndex++;
    }
    if (dateFilter.lte) {
      conditions.push(`"crimeRegDate" <= $${paramIndex}::timestamp`);
      params.push(dateFilter.lte.toISOString());
      paramIndex++;
    }

    return await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM firs_mv WHERE ${conditions.join(' AND ')};`,
      ...params
    );
  } else {
    return await prisma.$queryRawUnsafe<{ id: string }[]>(`SELECT id FROM firs_mv;`);
  }
}

export async function getOverallCrimeStats(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  const crimeIds = crimes.map(c => c.id);
  if (crimeIds.length === 0) {
    return {
      totalCases: 0,
      totalAccusedInvolved: 0,
      totalArrests: 0,
      totalSeizuresKg: 0,
      totalSeizuresMl: 0,
      totalSeizuresWorth: 0,
      totalCommercialFirs: 0,
      totalConvictionFirs: 0,
    };
  }
  const [totalAccusedInvolved, totalArrests, totalSeizures, totalCommercialFirs, totalConvictionFirs] =
    await Promise.all([
      prisma
        .$queryRawUnsafe<
          { count: number }[]
        >(`SELECT COUNT(*)::int AS count FROM accuseds_mv WHERE "crimeId" = ANY($1::text[]);`, crimeIds)
        .then(result => result?.[0]?.count ?? 0),
      prisma
        .$queryRawUnsafe<
          { count: number }[]
        >(`SELECT COUNT(*)::int AS count FROM accuseds_mv WHERE "crimeId" = ANY($1::text[]) AND "accusedStatus" = 'Arrested';`, crimeIds)
        .then(result => result?.[0]?.count ?? 0),
      prisma
        .$queryRawUnsafe<
          {
            standardizedWeightKg: number;
            standardizedVolumeMl: number;
            seizureWorth: number;
          }[]
        >(
          `SELECT 
            COALESCE(ROUND(SUM(standardized_weight_kg)), 0) as "standardizedWeightKg", 
            COALESCE(ROUND(SUM(standardized_volume_ml)), 0) as "standardizedVolumeMl", 
            COALESCE(ROUND(SUM(seizure_worth * 10000000)), 0) as "seizureWorth" 
           FROM brief_facts_drug
           WHERE "crime_id" = ANY($1::text[]);`,
          crimeIds
        )
        .then(result => result?.[0] ?? { standardizedWeightKg: 0, standardizedVolumeMl: 0, seizureWorth: 0 }),
      prisma
        .$queryRawUnsafe<
          { count: number }[]
        >(`SELECT COUNT(*)::int AS count FROM firs_mv WHERE id = ANY($1::text[]) AND "caseClassification" = 'Commercial';`, crimeIds)
        .then(result => result?.[0]?.count ?? 0),
      prisma
        .$queryRawUnsafe<
          { count: number }[]
        >(`SELECT COUNT(*)::int AS count FROM firs_mv WHERE id = ANY($1::text[]) AND "caseStatus" = 'Conviction';`, crimeIds)
        .then(result => result?.[0]?.count ?? 0),
    ]);

  return {
    totalCases: crimes.length,
    totalAccusedInvolved,
    totalArrests,
    totalSeizuresKg: String(totalSeizures.standardizedWeightKg),
    totalSeizuresMl: String(totalSeizures.standardizedVolumeMl),
    totalSeizuresWorth: String(totalSeizures.seizureWorth),
    totalCommercialFirs,
    totalConvictionFirs,
  };
}

export async function getCaseStatusClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        WITH mapped_statuses AS (
            SELECT
                f."id",
                CASE
                    WHEN UPPER(TRIM(f."caseStatus")) = 'UI' THEN 'UI'
                    WHEN UPPER(TRIM(f."caseStatus")) = 'CHARGESHEETED' THEN 'Chargesheeted'
                    WHEN UPPER(TRIM(f."caseStatus")) = 'PT' THEN 'PT'
                    WHEN UPPER(TRIM(f."caseStatus")) = 'CONVICTION' THEN 'Conviction'
                    WHEN UPPER(TRIM(f."caseStatus")) = 'ACQUITTAL' THEN 'Acquittal'
                    WHEN UPPER(TRIM(f."caseStatus")) IN ('ABATED', 'MISTAKE OF FACT', 'LACK OF EVIDENCE', 'ACTION DROPPED', 'UNDETECTED', 'ACTION ABATED') THEN 'Police Disposal'
                    WHEN UPPER(TRIM(f."caseStatus")) IN ('TRANSFER TO OTHER DEPARTMENT', 'TRANSFER TO OTHER P.S') THEN 'Transfer to Other Dept'
                    ELSE NULL
                END AS "mappedLabel"
            FROM firs_mv f
            WHERE f."id" = ANY($1)
        )
        SELECT
            ms."mappedLabel" AS "label",
            COUNT(*)::int AS "value"
        FROM mapped_statuses ms
        WHERE ms."mappedLabel" IS NOT NULL
        GROUP BY ms."mappedLabel"
        ORDER BY
            CASE ms."mappedLabel"
                WHEN 'UI' THEN 1
                WHEN 'Chargesheeted' THEN 2
                WHEN 'PT' THEN 3
                WHEN 'Conviction' THEN 4
                WHEN 'Acquittal' THEN 5
                WHEN 'Police Disposal' THEN 6
                WHEN 'Transfer to Other Dept' THEN 7
                ELSE 999
            END; 
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getRegionalOverview(from: string | undefined, to: string | undefined) {
  const dateFilter = buildDateFilter(from, to);
  const crimes = await prisma.crimes.findMany({
    ...(dateFilter && { where: { firDate: dateFilter } }),
    select: { id: true },
  });

  return await prisma.$queryRawUnsafe<
    {
      unit: string;
      firs: number;
      accusedCited: number;
      arrests: number;
      absconding: number;
      totalWorthOfSeizedDrugs: string;
      convictions: number;
      acquittals: number;
      commercialFirs: number;
      ganjaSeizuresKg: string;
      arrestedForeignNationals: number;
    }[]
  >(
    `
      WITH drug_aggregates AS (
        SELECT
          bfd."crime_id",
          SUM(COALESCE(bfd."seizure_worth" * 10000000, 0)) as "total_worth",
          SUM(CASE WHEN UPPER(TRIM(bfd."primary_drug_name")) = 'GANJA' THEN COALESCE(bfd."standardized_weight_kg", 0) ELSE 0 END) as "ganja_kg"
        FROM brief_facts_drug bfd
        WHERE bfd."crime_id" = ANY($1::text[])
        GROUP BY bfd."crime_id"
      ),
      accused_stats AS (
        SELECT
          a."crime_id",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(bfa."status")) = 'ARRESTED' THEN a."accused_id" END) as "arrests",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(bfa."status")) = 'ABSCONDING' THEN a."accused_id" END) as "absconding",
          COUNT(DISTINCT CASE 
            WHEN UPPER(TRIM(bfa."status")) = 'ARRESTED' 
            AND UPPER(TRIM(COALESCE(p."domicile_classification", ''))) = 'INTERNATIONAL'
            THEN a."accused_id" 
          END) as "arrested_foreign_nationals"
        FROM accused a
        LEFT JOIN agent_deduplication_tracker adt ON a."person_id" = ANY(adt."all_person_ids")
        LEFT JOIN persons p ON p."person_id"::text = adt."canonical_person_id"::text
        LEFT JOIN brief_facts_accused bfa ON bfa."accused_id" = a."accused_id"
        WHERE a."crime_id" = ANY($1::text[])
        GROUP BY a."crime_id"
      )
      SELECT
          f."unit" as "unit",
          COUNT(DISTINCT f."id")::integer as "firs",
          SUM(COALESCE(f."noOfAccusedInvolved", 0))::integer as "accusedCited",
          COALESCE(SUM(acc_stats."arrests"), 0)::integer as "arrests",
          COALESCE(SUM(acc_stats."absconding"), 0)::integer as "absconding",
          COALESCE(SUM(drug_agg."total_worth"), 0)::text as "totalWorthOfSeizedDrugs",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseStatus")) = 'CONVICTION' THEN f."id" END)::integer as "convictions",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseStatus")) = 'ACQUITTAL' THEN f."id" END)::integer as "acquittals",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'COMMERCIAL' THEN f."id" END)::integer as "commercialFirs",
          ROUND(COALESCE(SUM(drug_agg."ganja_kg"), 0))::text as "ganjaSeizuresKg",
          COALESCE(SUM(acc_stats."arrested_foreign_nationals"), 0)::integer as "arrestedForeignNationals"
      FROM
          firs_mv f
          LEFT JOIN drug_aggregates drug_agg ON drug_agg."crime_id" = f."id"
          LEFT JOIN accused_stats acc_stats ON acc_stats."crime_id" = f."id"
      WHERE f."id" = ANY($1::text[])
      GROUP BY f."unit";
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getDrugData(from: string | undefined, to: string | undefined, drugNames: string[]) {
  if (drugNames.length === 0) {
    return [] as { label: string; value: string }[];
  }

  const crimes = await getFirsWithDateFilter(from, to);
  const crimeIds = crimes.map(crime => crime.id);

  if (crimeIds.length === 0) {
    return [] as { label: string; value: string }[];
  }

  // Normalize drug names for SQL comparison
  const normalizedDrugNames = drugNames.map(name => name.trim().toUpperCase());
  const hasUnknown = normalizedDrugNames.includes('UNKNOWN');
  const otherDrugNames = normalizedDrugNames.filter(name => name !== 'UNKNOWN');

  // Build the drug name filter condition based on whether "Unknown" is included
  let drugNameCondition: string;
  const queryParams: any[] = [crimeIds];

  if (hasUnknown && otherDrugNames.length > 0) {
    // Both "Unknown" and other drug types selected
    queryParams.push(otherDrugNames);
    drugNameCondition = `(
      UPPER(TRIM(bfd."primary_drug_name")) = ANY($2::text[])
      OR NULLIF(TRIM(bfd."primary_drug_name"), 'NO_DRUGS_DETECTED') IS NULL
    )`;
  } else if (hasUnknown) {
    // Only "Unknown" selected
    drugNameCondition = `NULLIF(TRIM(bfd."primary_drug_name"), 'NO_DRUGS_DETECTED') IS NULL`;
  } else {
    // Only specific drug types (no "Unknown")
    queryParams.push(otherDrugNames);
    drugNameCondition = `UPPER(TRIM(bfd."primary_drug_name")) = ANY($2::text[])`;
  }

  const [result] = await prisma.$queryRawUnsafe<
    {
      totalQuantityKg: string;
      totalQuantityMl: string;
      totalQuantityCount: string;
      firsCommercial: number;
      firsIntermediate: number;
      firsSmall: number;
      firsCultivation: number;
      firsUnknown: number;
      totalSeizureWorth: string;
    }[]
  >(
    `
      WITH relevant_crimes AS (
        SELECT DISTINCT bfd."crime_id"
        FROM brief_facts_drug bfd
        WHERE bfd."crime_id" = ANY($1::text[])
          AND ${drugNameCondition}
      ),
      drug_totals AS (
        SELECT
          COALESCE(ROUND(SUM(bfd.standardized_weight_kg)), 0) AS total_kg,
          COALESCE(ROUND(SUM(bfd.standardized_volume_ml)), 0) AS total_ml,
          COALESCE(ROUND(SUM(bfd.standardized_count)), 0) AS total_count,
          COALESCE(ROUND(SUM(bfd.seizure_worth * 10000000)), 0) AS total_worth
        FROM brief_facts_drug bfd
        INNER JOIN relevant_crimes rc ON bfd.crime_id = rc.crime_id
        WHERE ${drugNameCondition}
      ),
      fir_classifications AS (
        SELECT
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'COMMERCIAL' THEN f."id" END)::integer AS commercial_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'INTERMEDIATE' THEN f."id" END)::integer AS intermediate_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'SMALL' THEN f."id" END)::integer AS small_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'CULTIVATION' THEN f."id" END)::integer AS cultivation_count,
          COUNT(DISTINCT CASE WHEN COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') = 'Unknown' THEN f."id" END)::integer AS unknown_count
        FROM firs_mv f
        INNER JOIN relevant_crimes rc ON f."id" = rc."crime_id"
      )
      SELECT
        COALESCE(dt.total_kg, 0)::text AS "totalQuantityKg",
        COALESCE(dt.total_ml, 0)::text AS "totalQuantityMl",
        COALESCE(dt.total_worth, 0)::text AS "totalSeizureWorth",
        COALESCE(dt.total_count, 0)::text AS "totalQuantityCount",
        COALESCE(fc.commercial_count, 0)::integer AS "firsCommercial",
        COALESCE(fc.intermediate_count, 0)::integer AS "firsIntermediate",
        COALESCE(fc.small_count, 0)::integer AS "firsSmall",
        COALESCE(fc.cultivation_count, 0)::integer AS "firsCultivation",
        COALESCE(fc.unknown_count, 0)::integer AS "firsUnknown"
      FROM drug_totals dt
      CROSS JOIN fir_classifications fc;
    `,
    ...queryParams
  );

  const safeResult = result ?? {
    totalQuantityKg: '0',
    totalQuantityMl: '0',
    totalQuantityCount: '0',
    firsCommercial: 0,
    firsIntermediate: 0,
    firsSmall: 0,
    firsCultivation: 0,
    firsUnknown: 0,
    totalSeizureWorth: '0',
  };

  const items: { label: string; value: string }[] = [];

  if (Number(safeResult.totalQuantityKg) > 0) {
    items.push({
      label: 'Quantity Seized (Kg)',
      value: safeResult.totalQuantityKg,
    });
  }

  if (Number(safeResult.totalQuantityMl) > 0) {
    items.push({
      label: 'Quantity Seized (Ml)',
      value: safeResult.totalQuantityMl,
    });
  }

  if (Number(safeResult.totalQuantityCount) > 0) {
    items.push({
      label: 'Quantity Seized (Packets/Pills)',
      value: safeResult.totalQuantityCount,
    });
  }

  items.push(
    {
      label: 'Commercial',
      value: String(safeResult.firsCommercial ?? 0),
    },
    {
      label: 'Intermediate',
      value: String(safeResult.firsIntermediate ?? 0),
    },
    {
      label: 'Small',
      value: String(safeResult.firsSmall ?? 0),
    },
    {
      label: 'Cultivation',
      value: String(safeResult.firsCultivation ?? 0),
    },
    {
      label: 'Unknown',
      value: String(safeResult.firsUnknown ?? 0),
    },
    {
      label: 'Seizure Worth',
      value: safeResult.totalSeizureWorth ?? '0',
    }
  );

  return items;
}

export async function getDrugCases(from: string | undefined, to: string | undefined) {
  const dateFilter = buildDateFilter(from, to);
  const crimes = await prisma.crimes.findMany({
    ...(dateFilter && { where: { firDate: dateFilter } }),
    select: { id: true },
  });

  return await prisma.$queryRawUnsafe<{ drugType: string; crimes: number; accuseds: number }[]>(
    `
        WITH drug_stats AS (
            SELECT 
                COALESCE(NULLIF(TRIM(bfd."primary_drug_name"), ''), 'Unknown') AS "drugType",
                COUNT(DISTINCT bfd."crime_id")::integer AS "crimes",
                COUNT(DISTINCT a."accused_id")::integer AS "accuseds"
            FROM brief_facts_drug bfd
            LEFT JOIN accused a ON a."crime_id" = bfd."crime_id"
            WHERE bfd."crime_id" = ANY($1)
            GROUP BY COALESCE(NULLIF(TRIM(bfd."primary_drug_name"), ''), 'Unknown')
        ),
        ranked AS (
            SELECT
                "drugType",
                "crimes",
                "accuseds",
                ROW_NUMBER() OVER (ORDER BY crimes DESC) AS "rn"
            FROM drug_stats
        ),
        top10 AS (
            SELECT "drugType", "crimes", "accuseds"
            FROM ranked
            WHERE rn <= 10
        ),
        others AS (
            SELECT
                'Others' AS "drugType",
                COALESCE(SUM(crimes), 0)::integer AS "crimes",
                COALESCE(SUM(accuseds), 0)::integer AS "accuseds"
            FROM ranked
            WHERE rn > 10
        )
        SELECT "drugType", "crimes", "accuseds"
        FROM (
            SELECT * FROM top10
            UNION ALL
            SELECT * FROM others
        ) t
        ORDER BY
            CASE WHEN "drugType" = 'Others' THEN 1 ELSE 0 END,
            "crimes" DESC;
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getCaseClassificationUI(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        SELECT
            COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') AS "label",
            COUNT(*)::int AS "value"
        FROM firs_mv f
        WHERE f."id" = ANY($1)
            AND UPPER(TRIM(f."caseStatus")) IN ('UI', 'UNDER INVESTIGATION')
        GROUP BY COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(*) DESC; 
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getTrialCasesClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        SELECT
            COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') AS "label",
            COUNT(*)::int AS "value"
        FROM firs_mv f
        WHERE f."id" = ANY($1)
            AND UPPER(TRIM(f."caseStatus")) IN ('PT', 'PENDING TRIAL')
        GROUP BY COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(*) DESC; 
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getAccusedTypeClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        SELECT
            COALESCE(NULLIF(TRIM(a."accusedType"), ''), 'Unknown') AS "label",
            COUNT(*)::int AS "value"
        FROM accuseds_mv a
        WHERE a."crimeId" = ANY($1)
        GROUP BY COALESCE(NULLIF(TRIM(a."accusedType"), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(a."accusedType"), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(*) DESC; 
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getDomicileClassification(from: string | undefined, to: string | undefined) {
  const dateFilter = buildDateFilter(from, to);

  // Build date filter conditions for SQL
  let dateFilterSql = '';
  const params: any[] = [];
  let paramIndex = 1;

  if (dateFilter) {
    const conditions: string[] = [];
    if (dateFilter.gte) {
      conditions.push(`(crime->>'crimeRegDate')::date >= $${paramIndex}::date`);
      params.push(dateFilter.gte.toISOString().split('T')[0]);
      paramIndex++;
    }
    if (dateFilter.lte) {
      conditions.push(`(crime->>'crimeRegDate')::date <= $${paramIndex}::date`);
      params.push(dateFilter.lte.toISOString().split('T')[0]);
      paramIndex++;
    }
    if (conditions.length > 0) {
      dateFilterSql = `WHERE crime->>'crimeRegDate' IS NOT NULL AND crime->>'crimeRegDate' != '' AND ${conditions.join(' AND ')}`;
    }
  }

  // If no date filter, get all profiles directly
  if (!dateFilter) {
    return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
      `
          SELECT
              COALESCE(NULLIF(TRIM(cp.domicile), ''), 'Unknown') AS "label",
              COUNT(*)::int AS "value"
          FROM criminal_profiles_mv cp
          GROUP BY COALESCE(NULLIF(TRIM(cp.domicile), ''), 'Unknown')
          ORDER BY 
              CASE WHEN COALESCE(NULLIF(TRIM(cp.domicile), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
              COUNT(*) DESC;
      `
    );
  }

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        WITH filtered_profiles AS (
            SELECT DISTINCT
                cp.id,
                cp.domicile
            FROM criminal_profiles_mv cp
            CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cp.crimes, '[]'::jsonb)) AS crime
            ${dateFilterSql}
        )
        SELECT
            COALESCE(NULLIF(TRIM(fp.domicile), ''), 'Unknown') AS "label",
            COUNT(*)::int AS "value"
        FROM filtered_profiles fp
        GROUP BY COALESCE(NULLIF(TRIM(fp.domicile), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(fp.domicile), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(*) DESC;
    `,
    ...params
  );
}

export async function getStipulatedTimeClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        SELECT
            COALESCE(f."stipulatedPeriodForCS", 'Unknown') AS "label",
            COUNT(*)::int AS "value"
        FROM firs_mv f
        WHERE f."id" = ANY($1)
          AND UPPER(TRIM(f."caseStatus")) IN ('UI', 'UNDER INVESTIGATION')
        GROUP BY COALESCE(f."stipulatedPeriodForCS", 'Unknown')
        ORDER BY COALESCE(f."stipulatedPeriodForCS", 'Unknown') ASC;
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getInvestigationRelatedInfo(from: string | undefined, to: string | undefined) {
  const dateFilter = buildDateFilter(from, to);
  const crimes = await prisma.crimes.findMany({
    ...(dateFilter && { where: { firDate: dateFilter } }),
    select: { id: true },
  });

  const crimeIds = crimes.map(c => c.id);
  if (crimeIds.length === 0) {
    return {
      totalCases: 0,
      totalAccusedInvolved: 0,
      totalArrests: 0,
    };
  }

  const [underInvestigation, totalArrests, totalAbsconding] = await Promise.all([
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'ui cases', mode: 'insensitive' },
      },
    }),
    prisma.accused.count({
      where: {
        crimeId: { in: crimeIds },
        briefFactsAccused: {
          status: { contains: 'arrested', mode: 'insensitive' },
        },
      },
    }),
    prisma.accused.count({
      where: {
        crimeId: { in: crimeIds },
        briefFactsAccused: {
          status: { contains: 'absconding', mode: 'insensitive' },
        },
      },
    }),
  ]);

  return {
    underInvestigation,
    arrested: totalArrests,
    absconding: totalAbsconding,
  };
}

export async function getCourtRelatedInfo(from: string | undefined, to: string | undefined) {
  const dateFilter = buildDateFilter(from, to);
  const crimes = await prisma.crimes.findMany({
    ...(dateFilter && { where: { firDate: dateFilter } }),
    select: { id: true },
  });

  const crimeIds = crimes.map(c => c.id);
  if (crimeIds.length === 0) {
    return {
      totalCases: 0,
      totalAccusedInvolved: 0,
      totalArrests: 0,
    };
  }

  const [pendingTrial] = await Promise.all([
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'pt cases', mode: 'insensitive' },
      },
    }),
  ]);

  return {
    casesPendingTrial: pendingTrial,
  };
}
