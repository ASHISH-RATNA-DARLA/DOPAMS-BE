-- id: crime_id UNIQUE NOT NULL
-- psCode: ps_code NOT NULL
-- firNum: fir_num, NULL if fir_num is NULL or empty
-- firRegNum: fir_reg_num, NULL if fir_reg_num is NULL or empty
-- firType: fir_type, NULL if fir_type is NULL or empty
-- sections: acts_sections, NULL if acts_sections is NULL or empty
-- firDate: fir_date
-- majorHead: major_head, NULL if major_head is NULL or empty
-- minorHead: minor_head, NULL if minor_head is NULL or empty
-- crimeType: crime_type, NULL if crime_type is NULL or empty
-- ioName: io_name, NULL if io_name is NULL or empty
-- ioRank: io_rank, NULL if io_rank is NULL or empty
-- briefFacts: brief_facts, NULL if brief_facts is NULL or empty
-- caseStatus: case_status, UNKNOWN if case_status is NULL or empty
-- caseClass: class_classification, UNKNOWN if class_classification is NULL or empty
-- stipulatedPeriodForCS: stipulated period for case status, NULL if fir_date is NULL or empty
-- psName: ps_name, UNKNOWN if ps_name is NULL or empty
-- circleCode: circle_code, NULL if circle_code is NULL or empty
-- circleName: circle_name, NULL if circle_name is NULL or empty
-- sdpoCode: sdpo_code, NULL if sdpo_code is NULL or empty
-- sdpoName: sdpo_name, NULL if sdpo_name is NULL or empty
-- subZoneCode: sub_zone_code, NULL if sub_zone_code is NULL or empty
-- subZoneName: sub_zone_name, NULL if sub_zone_name is NULL or empty
-- distCode: dist_code, NULL if dist_code is NULL or empty
-- distName: dist_name, UNKNOWN if dist_name is NULL or empty
-- rangeCode: range_code, NULL if range_code is NULL or empty
-- rangeName: range_name, NULL if range_name is NULL or empty
-- zoneCode: zone_code, NULL if zone_code is NULL or empty
-- zoneName: zone_name, NULL if zone_name is NULL or empty
-- adgCode: adg_code, NULL if adg_code is NULL or empty
-- adgName: adg_name, NULL if adg_name is NULL or empty
SELECT
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.crime_id
    ),
    ''::text
  ) AS id,
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.ps_code
    ),
    ''::text
  ) AS "psCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.fir_num
    ),
    ''::text
  ) AS "firNum",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.fir_reg_num
    ),
    ''::text
  ) AS "firRegNum",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.fir_type
    ),
    ''::text
  ) AS "firType",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.acts_sections
    ),
    ''::text
  ) AS sections,
  c.fir_date AS "firDate",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.major_head
    ),
    ''::text
  ) AS "majorHead",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.minor_head
    ),
    ''::text
  ) AS "minorHead",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.crime_type
    ),
    ''::text
  ) AS "crimeType",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.io_name
    ),
    ''::text
  ) AS "ioName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.io_rank
    ),
    ''::text
  ) AS "ioRank",
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.brief_facts
    ),
    ''::text
  ) AS "briefFacts",
  CASE
    WHEN (
      (c.case_status IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            c.case_status
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        c.case_status
    )
  END AS "caseStatus",
  CASE
    WHEN (
      (c.class_classification IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            c.class_classification
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        c.class_classification
    )
  END AS "caseClass",
  CASE
    WHEN (c.fir_date IS NULL) THEN NULL::text
    WHEN (
      (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) >= (0)::double precision
      )
      AND (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) <= (30)::double precision
      )
    ) THEN '0 - 30 Days'::text
    WHEN (
      (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) > (30)::double precision
      )
      AND (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) <= (60)::double precision
      )
    ) THEN '31 - 60 Days'::text
    WHEN (
      (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) > (60)::double precision
      )
      AND (
        date_part(
          'day'::text,
          (NOW() - (c.fir_date)::timestamp WITH time zone)
        ) <= (90)::double precision
      )
    ) THEN '61 - 90 Days'::text
    WHEN (
      date_part(
        'day'::text,
        (NOW() - (c.fir_date)::timestamp WITH time zone)
      ) > (90)::double precision
    ) THEN 'More than 90 Days'::text
    ELSE NULL::text
  END AS "stipulatedPeriodForCS",
  CASE
    WHEN (
      (h.ps_name IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            h.ps_name
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        h.ps_name
    )
  END AS "psName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.circle_code
    ),
    ''::text
  ) AS "circleCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.circle_name
    ),
    ''::text
  ) AS "circleName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.sdpo_code
    ),
    ''::text
  ) AS "sdpoCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.sdpo_name
    ),
    ''::text
  ) AS "sdpoName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.sub_zone_code
    ),
    ''::text
  ) AS "subZoneCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.sub_zone_name
    ),
    ''::text
  ) AS "subZoneName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.dist_code
    ),
    ''::text
  ) AS "distCode",
  CASE
    WHEN (
      (h.dist_name IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            h.dist_name
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        h.dist_name
    )
  END AS "distName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.range_code
    ),
    ''::text
  ) AS "rangeCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.range_name
    ),
    ''::text
  ) AS "rangeName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.zone_code
    ),
    ''::text
  ) AS "zoneCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.zone_name
    ),
    ''::text
  ) AS "zoneName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.adg_code
    ),
    ''::text
  ) AS "adgCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        h.adg_name
    ),
    ''::text
  ) AS "adgName",
  COALESCE(drug_quantities.types, '[]'::jsonb) AS "drugDetails"
FROM
  (
    (
      crimes c
      LEFT JOIN hierarchy h ON (((c.ps_code)::text = (h.ps_code)::text))
    )
    LEFT JOIN (
      SELECT
        q.crime_id,
        jsonb_agg(
          jsonb_build_object(
            'name',
            q.primary_drug_name,
            'quantityKg',
            q.total_quantity_kg,
            'quantityMl',
            q.total_quantity_ml,
            'quantityCount',
            q.total_quantity_count,
            'worth',
            q.total_worth
          )
        ) AS TYPES
      FROM
        (
          SELECT
            bfd.crime_id,
            bfd.primary_drug_name,
            round(sum(bfd.standardized_weight_kg), 2) AS total_quantity_kg,
            round(sum(bfd.standardized_volume_ml), 2) AS total_quantity_ml,
            round(sum(bfd.standardized_count), 2) AS total_quantity_count,
            round(sum(bfd.seizure_worth * (10000000)::numeric), 2) AS total_worth
          FROM
            brief_facts_drug bfd
          WHERE
            (
              NULLIF(
                TRIM(
                  BOTH
                  FROM
                    bfd.primary_drug_name
                ),
                ''::text
              ) IS NOT NULL
            )
          GROUP BY
            bfd.crime_id,
            bfd.primary_drug_name
        ) q
      GROUP BY
        q.crime_id
    ) drug_quantities ON (
      (
        (drug_quantities.crime_id)::text = (c.crime_id)::text
      )
    )
  );