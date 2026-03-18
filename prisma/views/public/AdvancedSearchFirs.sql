SELECT
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.crime_id
    ),
    '' :: text
  ) AS id,
  c.fir_num AS "firNum",
  c.fir_date AS "firDate",
  c.ps_code AS "psCode",
  h.ps_name AS "psName",
  h.dist_name AS "districtName",
  COALESCE(drug_quantities.types, '[]' :: jsonb) AS "drugDetails"
FROM
  (
    (
      crimes c
      LEFT JOIN hierarchy h ON (((c.ps_code) :: text = (h.ps_code) :: text))
    )
    LEFT JOIN (
      SELECT
        aggregated.crime_id,
        jsonb_agg(
          jsonb_build_object(
            'name',
            aggregated.primary_drug_name,
            'quantityKg',
            aggregated.total_kg,
            'quantityMl',
            aggregated.total_ml,
            'quantityCount',
            aggregated.total_count,
            'worth',
            aggregated.total_worth
          )
        ) AS TYPES
      FROM
        (
          SELECT
            bfd.crime_id,
            bfd.primary_drug_name,
            sum(COALESCE(bfd.weight_kg, (0) :: numeric)) AS total_kg,
            sum(COALESCE(bfd.volume_ml, (0) :: numeric)) AS total_ml,
            sum(COALESCE(bfd.count_total, (0) :: numeric)) AS total_count,
            sum(COALESCE(bfd.seizure_worth, (0) :: numeric)) AS total_worth
          FROM
            brief_facts_drug bfd
          GROUP BY
            bfd.crime_id,
            bfd.primary_drug_name
        ) aggregated
      GROUP BY
        aggregated.crime_id
    ) drug_quantities ON (
      (
        (drug_quantities.crime_id) :: text = (c.crime_id) :: text
      )
    )
  );