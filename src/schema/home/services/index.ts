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
      totalSeizuresKg: '0',
      totalSeizuresL: '0',
      totalSeizureCount: '0',
      totalSeizuresWorth: '0',
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
        .$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*)::int AS count FROM accuseds_mv WHERE "crimeId" = ANY($1::text[]) AND (
            UPPER(TRIM("accusedStatus")) LIKE 'ARREST%' 
            OR UPPER(TRIM("accusedStatus")) LIKE 'SURRENDERED%'
          );`,
          crimeIds
        )
        .then(result => result?.[0]?.count ?? 0),
      prisma
        .$queryRawUnsafe<
          {
            totalWeightKg: number;
            totalVolumeL: number;
            totalSeizureWorth: number;
            totalCount: number;
          }[]
        >(
          `SELECT 
            COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) IN ('solid', 'powder') THEN weight_kg ELSE 0 END), 0) as "totalWeightKg", 
            COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) = 'liquid' THEN volume_l ELSE 0 END), 0) as "totalVolumeL", 
            COALESCE(SUM(seizure_worth), 0) as "totalSeizureWorth",
            COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) = 'count' THEN count_total ELSE 0 END), 0) as "totalCount"
           FROM brief_facts_drug
           WHERE crime_id = ANY($1::text[]);`,
          crimeIds
        )
        .then(result => result?.[0] ?? { totalWeightKg: 0, totalVolumeL: 0, totalSeizureWorth: 0, totalCount: 0 }),
      prisma
        .$queryRawUnsafe<
          { count: number }[]
        >(`SELECT COUNT(*)::int AS count FROM firs_mv WHERE id = ANY($1::text[]) AND UPPER(TRIM("caseClassification")) = 'COMMERCIAL';`, crimeIds)
        .then(result => result?.[0]?.count ?? 0),
      prisma
        .$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(DISTINCT id)::int AS count FROM firs_mv 
           WHERE id = ANY($1::text[]) 
           AND EXISTS (SELECT 1 FROM jsonb_array_elements("disposalDetails") elem WHERE elem->>'disposalType' ILIKE $2);`,
          crimeIds,
          '%onvict%'
        )
        .then(result => result?.[0]?.count ?? 0),
    ]);

  return {
    totalCases: crimes.length,
    totalAccusedInvolved,
    totalArrests,
    totalSeizuresKg: String(totalSeizures.totalWeightKg),
    totalSeizuresL: String(totalSeizures.totalVolumeL),
    totalSeizureCount: String(totalSeizures.totalCount),
    totalSeizuresWorth: String(totalSeizures.totalSeizureWorth),
    totalCommercialFirs,
    totalConvictionFirs,
  };
}

export async function getSeizuresByDrugForm(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  const crimeIds = crimes.map(c => c.id);
  if (crimeIds.length === 0) {
    return {
      solidSeizuresKg: '0',
      solidSeizuresG: '0',
      liquidSeizuresL: '0',
      liquidSeizuresMl: '0',
      countSeizuresUnits: '0',
    };
  }

  const seizuresByForm = await prisma.$queryRawUnsafe<
    {
      drug_form: string;
      totalWeightG: number;
      totalWeightKg: number;
      totalVolumeMl: number;
      totalVolumeL: number;
      totalCount: number;
    }[]
  >(
    `SELECT 
      LOWER(TRIM(drug_form)) as drug_form,
      COALESCE(SUM(weight_g), 0) as "totalWeightG",
      COALESCE(SUM(weight_kg), 0) as "totalWeightKg",
      COALESCE(SUM(volume_ml), 0) as "totalVolumeMl",
      COALESCE(SUM(volume_l), 0) as "totalVolumeL",
      COALESCE(SUM(count_total), 0) as "totalCount"
     FROM brief_facts_drug
     WHERE crime_id = ANY($1::text[])
     AND drug_form IS NOT NULL
     AND LOWER(TRIM(drug_form)) NOT IN ('none')
     GROUP BY LOWER(TRIM(drug_form));`,
    crimeIds
  );

  let solidKg = 0;
  let solidG = 0;
  let liquidL = 0;
  let liquidMl = 0;
  let countUnits = 0;

  for (const row of seizuresByForm) {
    if (row.drug_form === 'solid' || row.drug_form === 'powder') {
      solidKg += Number(row.totalWeightKg);
      solidG += Number(row.totalWeightG);
    } else if (row.drug_form === 'liquid') {
      liquidL += Number(row.totalVolumeL);
      liquidMl += Number(row.totalVolumeMl);
    } else if (row.drug_form === 'count') {
      countUnits += Number(row.totalCount);
    }
  }

  return {
    solidSeizuresKg: String(solidKg),
    solidSeizuresG: String(solidG),
    liquidSeizuresL: String(liquidL),
    liquidSeizuresMl: String(liquidMl),
    countSeizuresUnits: String(countUnits),
  };
}

export async function getCaseStatusClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        WITH disposal_status AS (
            SELECT
                f."id",
                CASE
                    WHEN UPPER(TRIM(f."caseStatus")) IN ('UI', 'UNDER INVESTIGATION') THEN 'UI'
                    WHEN UPPER(TRIM(f."caseStatus")) IN ('PT', 'PENDING TRIAL') THEN 'PT'
                    WHEN UPPER(TRIM(f."caseStatus")) = 'CHARGESHEETED' THEN 'Chargesheeted'
                    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE elem->>'disposalType' ILIKE '%onvict%') THEN 'Conviction'
                    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE elem->>'disposalType' ILIKE '%cquitt%') THEN 'Acquittal'
                    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE UPPER(TRIM(elem->>'disposalType')) IN ('ABATED', 'ACTION ABATED', 'ACTION ABATED (DEATH OF ACCUSED)', 'MISTAKE OF FACT', 'LACK OF EVIDENCE', 'ACTION DROPPED', 'UNDETECTABLE', 'COMPOUNDED', 'COMPROMISED', 'CIVIL NATURE', 'ANY OTHER')) THEN 'Police Disposal'
                    WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE elem->>'disposalType' ILIKE '%ransfer%') THEN 'Transfer to Other Dept'
                    ELSE 'Others'
                END AS "mappedLabel"
            FROM firs_mv f
            WHERE f."id" = ANY($1)
        )
        SELECT
            ds."mappedLabel" AS "label",
            COUNT(DISTINCT ds."id")::int AS "value"
        FROM disposal_status ds
        GROUP BY ds."mappedLabel"
        ORDER BY
            CASE ds."mappedLabel"
                WHEN 'UI' THEN 1
                WHEN 'PT' THEN 2
                WHEN 'Chargesheeted' THEN 3
                WHEN 'Conviction' THEN 4
                WHEN 'Acquittal' THEN 5
                WHEN 'Police Disposal' THEN 6
                WHEN 'Transfer to Other Dept' THEN 7
                WHEN 'Others' THEN 8
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
          SUM(COALESCE(bfd."seizure_worth", 0)) as "total_worth",
          SUM(CASE WHEN UPPER(TRIM(bfd."primary_drug_name")) = 'GANJA' THEN COALESCE(bfd."weight_kg", 0) ELSE 0 END) as "ganja_kg"
        FROM brief_facts_drug bfd
        WHERE bfd."crime_id" = ANY($1::text[])
        GROUP BY bfd."crime_id"
      ),
      accused_stats AS (
        SELECT
          a."crime_id",
          COUNT(DISTINCT CASE WHEN (UPPER(TRIM(bfa."status")) LIKE 'ARREST%' OR UPPER(TRIM(bfa."status")) LIKE 'SURRENDERED%') THEN a."accused_id" END) as "arrests",
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(bfa."status")) = 'ABSCONDING' THEN a."accused_id" END) as "absconding",
          COUNT(DISTINCT CASE 
            WHEN (UPPER(TRIM(bfa."status")) LIKE 'ARREST%' OR UPPER(TRIM(bfa."status")) LIKE 'SURRENDERED%')
            AND UPPER(TRIM(COALESCE(p."domicile_classification", ''))) = 'INTERNATIONAL'
            THEN a."accused_id" 
          END) as "arrested_foreign_nationals"
        FROM accused a
        LEFT JOIN persons p ON p."person_id"::text = a."person_id"::text
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
          COUNT(DISTINCT CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE elem->>'disposalType' ILIKE '%onvict%') THEN f."id" END)::integer as "convictions",
          COUNT(DISTINCT CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(f."disposalDetails") elem WHERE elem->>'disposalType' ILIKE '%cquitt%') THEN f."id" END)::integer as "acquittals",
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

  const normalizedDrugNames = drugNames.map(name => name.trim().toUpperCase());

  let drugNameCondition: string;
  const queryParams: any[] = [crimeIds];

  queryParams.push(normalizedDrugNames);
  drugNameCondition = `UPPER(TRIM(bfd."primary_drug_name")) = ANY($2::text[])`;

  const [result] = await prisma.$queryRawUnsafe<
    {
      totalQuantityKg: string;
      totalQuantityL: string;
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
          -- Fix: Use TRUNC to keep 2 decimal places without rounding (truncate instead)
          COALESCE(TRUNC(SUM(CASE WHEN LOWER(TRIM(bfd.drug_form)) IN ('solid', 'powder') THEN bfd.weight_kg ELSE 0 END), 2), 0) AS total_kg,
          COALESCE(TRUNC(SUM(CASE WHEN LOWER(TRIM(bfd.drug_form)) = 'liquid' THEN bfd.volume_l ELSE 0 END), 2), 0) AS total_l,
          COALESCE(TRUNC(SUM(CASE WHEN LOWER(TRIM(bfd.drug_form)) = 'count' THEN bfd.count_total ELSE 0 END), 2), 0) AS total_count,
          COALESCE(TRUNC(SUM(bfd.seizure_worth), 2), 0) AS total_worth
        FROM brief_facts_drug bfd
        INNER JOIN relevant_crimes rc ON bfd.crime_id = rc.crime_id
        WHERE ${drugNameCondition}
      ),
      fir_classifications AS (
        -- FIXED: Apply drug filter to match seizure quantities (align semantic meaning)
        -- Only count FIRs that have seizures of the selected drugs
        -- This ensures consistency: if you filter by HEROIN, you only see HEROIN case classifications
        SELECT
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'COMMERCIAL' THEN f."id" END)::integer AS commercial_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'INTERMEDIATE' THEN f."id" END)::integer AS intermediate_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'SMALL' THEN f."id" END)::integer AS small_count,
          COUNT(DISTINCT CASE WHEN UPPER(TRIM(f."caseClassification")) = 'CULTIVATION' THEN f."id" END)::integer AS cultivation_count,
          COUNT(DISTINCT CASE WHEN COALESCE(NULLIF(TRIM(f."caseClassification"), ''), 'Unknown') = 'Unknown' THEN f."id" END)::integer AS unknown_count
        FROM firs_mv f
        INNER JOIN relevant_crimes rc ON f."id" = rc.crime_id
      )
      SELECT
        COALESCE(dt.total_kg, 0)::text AS "totalQuantityKg",
        COALESCE(dt.total_l, 0)::text AS "totalQuantityL",
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
    totalQuantityL: '0',
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
    items.push({ label: 'Quantity Seized (Kg)', value: safeResult.totalQuantityKg });
  }
  if (Number(safeResult.totalQuantityL) > 0) {
    items.push({ label: 'Quantity Seized (L)', value: safeResult.totalQuantityL });
  }
  if (Number(safeResult.totalQuantityCount) > 0) {
    items.push({ label: 'Quantity Seized (Packets/Pills)', value: safeResult.totalQuantityCount });
  }

  items.push(
    { label: 'Commercial', value: String(safeResult.firsCommercial ?? 0) },
    { label: 'Intermediate', value: String(safeResult.firsIntermediate ?? 0) },
    { label: 'Small', value: String(safeResult.firsSmall ?? 0) },
    { label: 'Cultivation', value: String(safeResult.firsCultivation ?? 0) },
    { label: 'Unknown', value: String(safeResult.firsUnknown ?? 0) },
    { label: 'Seizure Worth', value: safeResult.totalSeizureWorth ?? '0' }
  );

  return items;
}

export async function getDrugList() {
  const result = await prisma.$queryRawUnsafe<{ drug_name: string }[]>(
    `SELECT DISTINCT UPPER(TRIM(primary_drug_name)) as drug_name 
     FROM brief_facts_drug 
     WHERE primary_drug_name IS NOT NULL AND TRIM(primary_drug_name) != '';`
  );

  return result
    .map(r => r.drug_name)
    .filter(name => name !== 'NO_DRUGS_DETECTED' && name !== 'UNKNOWN')
    .sort();
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
            COALESCE(NULLIF(TRIM(bfa."accused_type"), ''), 'Unknown') AS "label",
            COUNT(DISTINCT a."accused_id")::int AS "value"
        FROM accused a
        LEFT JOIN brief_facts_accused bfa ON bfa."accused_id" = a."accused_id"
        WHERE a."crime_id" = ANY($1)
        GROUP BY COALESCE(NULLIF(TRIM(bfa."accused_type"), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(bfa."accused_type"), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(DISTINCT a."accused_id") DESC; 
    `,
    crimes.map(crime => crime.id)
  );
}

export async function getDomicileClassification(from: string | undefined, to: string | undefined) {
  const crimes = await getFirsWithDateFilter(from, to);

  return await prisma.$queryRawUnsafe<{ label: string; value: number }[]>(
    `
        SELECT
            COALESCE(NULLIF(TRIM(p."domicile_classification"), ''), 'Unknown') AS "label",
            COUNT(DISTINCT a."accused_id")::int AS "value"
        FROM accused a
        LEFT JOIN persons p ON a."person_id"::text = p."person_id"::text
        WHERE a."crime_id" = ANY($1)
        GROUP BY COALESCE(NULLIF(TRIM(p."domicile_classification"), ''), 'Unknown')
        ORDER BY 
            CASE WHEN COALESCE(NULLIF(TRIM(p."domicile_classification"), ''), 'Unknown') = 'Unknown' THEN 1 ELSE 0 END,
            COUNT(DISTINCT a."accused_id") DESC;
    `,
    crimes.map(crime => crime.id)
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
      underInvestigation: 0,
      BNSS: 0,
      arrested: 0,
      absconding: 0,
      fslPending: 0,
      chargeSheetFiled: 0,
      ccNoReceived: 0,
      casesCrossedMandatoryTime: 0,
      propertyForfeitureOrders: 0,
      pitndpsInitiated: 0,
    };
  }

  const [
    underInvestigation,
    totalArrests,
    totalAbsconding,
    totalBNSS, // FIX: was prisma.arrest (wrong model + wrong field name)
    totalFslPending,
    totalChargeSheetFiled,
    totalCCNoReceived,
    totalPropertyForfeiture,
    casesCrossedMandatoryTime, // FIX: was hardcoded 0
  ] = await Promise.all([
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'UI', mode: 'insensitive' },
      },
    }),
    prisma
      .$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(DISTINCT a."accused_id")::int AS count
       FROM accused a
       LEFT JOIN brief_facts_accused bfa ON bfa."accused_id" = a."accused_id"
       WHERE a."crime_id" = ANY($1::text[])
         AND (UPPER(TRIM(COALESCE(bfa."status", ''))) LIKE 'ARREST%' 
              OR UPPER(TRIM(COALESCE(bfa."status", ''))) LIKE 'SURRENDERED%')`,
        crimeIds
      )
      .then(r => r?.[0]?.count ?? 0),
    prisma
      .$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
       FROM accused a
       LEFT JOIN brief_facts_accused bfa ON a."accused_id" = bfa."accused_id"
       WHERE a.crime_id = ANY($1::text[])
         AND bfa.status ILIKE '%absconding%'`,
        crimeIds
      )
      .then(r => r?.[0]?.count ?? 0),
    // FIX: DB table is `arrests`, column is `is_41a_crpc` — prisma.arrest doesn't exist
    prisma
      .$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
       FROM arrests
       WHERE crime_id = ANY($1::text[])
         AND is_41a_crpc = true`,
        crimeIds
      )
      .then(r => r?.[0]?.count ?? 0),
    prisma.fslCaseProperty.count({
      where: {
        crimeId: { in: crimeIds },
        status: { contains: 'pending', mode: 'insensitive' },
      },
    }),
    prisma.chargesheet.count({
      where: { crimeId: { in: crimeIds } },
    }),
    prisma.chargeSheetUpdate.count({
      where: {
        crimeId: { in: crimeIds },
        takenOnFileCaseType: { not: null },
      },
    }),
    prisma.disposal.count({
      where: {
        crimeId: { in: crimeIds },
        disposalType: { contains: 'property', mode: 'insensitive' },
      },
    }),
    // FIX: was hardcoded 0 — UI cases older than 60 days (verified returns real data)
    prisma
      .$queryRawUnsafe<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
       FROM crimes
       WHERE id = ANY($1::text[])
         AND UPPER(TRIM(case_status)) = 'UI'
         AND fir_date <= now() - INTERVAL '60 days'`,
        crimeIds
      )
      .then(r => r?.[0]?.count ?? 0),
  ]);

  return {
    underInvestigation,
    BNSS: totalBNSS,
    arrested: totalArrests,
    absconding: totalAbsconding,
    fslPending: totalFslPending,
    chargeSheetFiled: totalChargeSheetFiled,
    ccNoReceived: totalCCNoReceived,
    casesCrossedMandatoryTime,
    propertyForfeitureOrders: totalPropertyForfeiture,
    pitndpsInitiated: 0,
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
      casesPendingTrial: 0,
      casesAcquitted: 0,
      casesConvicted: 0,
      casesAbated: 0,
      bailPetitionsFiled: 0,
      bailGranted: 0,
      bailRejected: 0,
      nbwsExecuted: 0,
      totalTrialConducted: 0,
    };
  }

  const [pendingTrial, acquitted, convicted, abated, nbwRequested] = await Promise.all([
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'PT', mode: 'insensitive' },
      },
    }),
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'ACQUITTAL', mode: 'insensitive' },
      },
    }),
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'CONVICTION', mode: 'insensitive' },
      },
    }),
    prisma.crimes.count({
      where: {
        id: { in: crimeIds },
        caseStatus: { contains: 'ABATED', mode: 'insensitive' },
      },
    }),
    prisma.chargesheetAccused.count({
      where: {
        chargesheet: {
          crimeId: { in: crimeIds },
        },
        requestedForNbw: true,
      },
    }),
  ]);

  return {
    casesPendingTrial: pendingTrial,
    casesAcquitted: acquitted,
    casesConvicted: convicted,
    casesAbated: abated,
    bailPetitionsFiled: 0,
    bailGranted: 0,
    bailRejected: 0,
    nbwsExecuted: nbwRequested,
    totalTrialConducted: 0,
  };
}
