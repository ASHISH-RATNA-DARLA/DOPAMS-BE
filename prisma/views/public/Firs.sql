-- id: crime_id UNIQUE NOT NULL
-- unit: dist_name, UNKNOWN if dist_name is NULL or empty
-- ps: ps_name, UNKNOWN if ps_name is NULL or empty
-- year: year of fir_date
-- firNumber: fir_num, NULL if fir_num is NULL or empty
-- firRegNum: fir_reg_num, NULL if fir_reg_num is NULL or empty
-- section: acts_sections, NULL if acts_sections is NULL or empty
-- firType: fir_type, NULL if fir_type is NULL or empty
-- crimeType: crime_type, NULL if crime_type is NULL or empty
-- crimeRegDate: fir_date
-- majorHead: major_head, NULL if major_head is NULL or empty
-- minorHead: minor_head, NULL if minor_head is NULL or empty
-- ioName: io_name, NULL if io_name is NULL or empty
-- ioRank: io_rank, NULL if io_rank is NULL or empty
-- briefFacts: brief_facts, NULL if brief_facts is NULL or empty
-- caseClassification: class_classification, UNKNOWN if class_classification is NULL or empty
-- caseStatus: case_status, UNKNOWN if case_status is NULL or empty
-- stipulatedPeriodForCS: stipulated period for case status, NULL if fir_date is NULL or empty
-- noOfAccusedInvolved: count of accused_id in accused table
SELECT
  c.crime_id AS id,
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
  END AS unit,
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
  END AS ps,
  EXTRACT(
    year
    FROM
      c.fir_date
  )::integer AS year,
  NULLIF(
    TRIM(
      BOTH
      FROM
        c.fir_num
    ),
    ''::text
  ) AS "firNumber",
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
        c.acts_sections
    ),
    ''::text
  ) AS section,
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
        c.crime_type
    ),
    ''::text
  ) AS "crimeType",
  c.fir_date AS "crimeRegDate",
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
  END AS "caseClassification",
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
  COALESCE(accused_count.count, 0) AS "noOfAccusedInvolved",
  COALESCE(accused_details.details, '[]'::jsonb) AS "accusedDetails",
  COALESCE(drug_types.types, '{}'::text[]) AS "drugType",
  COALESCE(drug_quantities.types, '[]'::jsonb) AS "drugWithQuantity",
  COALESCE(property_details.details, '[]'::jsonb) AS "propertyDetails",
  COALESCE(mo_seizures_details.details, '[]'::jsonb) AS "moSeizuresDetails",
  COALESCE(chargesheets_data.chargesheets, '[]'::jsonb) AS chargesheets,
  COALESCE(
    chargesheet_updates_data.chargesheet_updates,
    '[]'::jsonb
  ) AS "chargesheetUpdates",
  COALESCE(disposal_details.details, '[]'::jsonb) AS "disposalDetails",
  COALESCE(ir_details_data.details, '[]'::jsonb) AS "irDetails",
  COALESCE(fsl_case_property_details.details, '[]'::jsonb) AS "casePropertyDetails",
  COALESCE(crime_documents.docs, '[]'::jsonb) AS documents,
  fir_copy_file.file_url AS "firCopy",
  COALESCE(property_documents.docs, '[]'::jsonb) AS "propertyDocuments",
  COALESCE(ir_documents.docs, '[]'::jsonb) AS "irDocuments"
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      (
                        (
                          crimes c
                          LEFT JOIN hierarchy h ON (((h.ps_code)::text = (c.ps_code)::text))
                        )
                        LEFT JOIN (
                          SELECT
                            a.crime_id,
                            (count(a.accused_id))::integer AS count
                          FROM
                            (
                              accused a
                              LEFT JOIN agent_deduplication_tracker adt_count ON (
                                (
                                  (a.person_id)::text = ANY (adt_count.all_person_ids)
                                )
                              )
                            )
                          GROUP BY
                            a.crime_id
                        ) accused_count ON (
                          (
                            (accused_count.crime_id)::text = (c.crime_id)::text
                          )
                        )
                      )
                      LEFT JOIN (
                        SELECT
                          a.crime_id,
                          jsonb_agg(
                            jsonb_build_object(
                              'id',
                              p.person_id,
                              'accusedId',
                              a.accused_id,
                              'accusedCode',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.accused_code
                                ),
                                ''::text
                              ),
                              'seqNum',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.seq_num
                                ),
                                ''::text
                              ),
                              'isCCL',
                              a.is_ccl,
                              'beard',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.beard
                                ),
                                ''::text
                              ),
                              'build',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.build
                                ),
                                ''::text
                              ),
                              'color',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.color
                                ),
                                ''::text
                              ),
                              'ear',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.ear
                                ),
                                ''::text
                              ),
                              'eyes',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.eyes
                                ),
                                ''::text
                              ),
                              'face',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.face
                                ),
                                ''::text
                              ),
                              'hair',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.hair
                                ),
                                ''::text
                              ),
                              'height',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.height
                                ),
                                ''::text
                              ),
                              'leucoderma',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.leucoderma
                                ),
                                ''::text
                              ),
                              'mole',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.mole
                                ),
                                ''::text
                              ),
                              'mustache',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.mustache
                                ),
                                ''::text
                              ),
                              'nose',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.nose
                                ),
                                ''::text
                              ),
                              'teeth',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    a.teeth
                                ),
                                ''::text
                              ),
                              'name',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.name)::text
                                ),
                                ''::text
                              ),
                              'surname',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.surname)::text
                                ),
                                ''::text
                              ),
                              'alias',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.alias)::text
                                ),
                                ''::text
                              ),
                              'fullName',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.full_name)::text
                                ),
                                ''::text
                              ),
                              'relativeName',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.relative_name)::text
                                ),
                                ''::text
                              ),
                              'emailId',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (p.email_id)::text
                                ),
                                ''::text
                              ),
                              'status',
                              CASE
                                WHEN (ar.arrested_date IS NOT NULL) THEN 'Arrested'::text
                                WHEN (ar.is_arrested IS TRUE) THEN 'Arrested'::text
                                WHEN (ar.is_apprehended IS TRUE) THEN 'Arrested'::text
                                WHEN (ar.is_absconding IS TRUE) THEN 'Absconding'::text
                                WHEN (ar.is_died IS TRUE) THEN 'Died'::text
                                WHEN (
                                  (bfa.status IS NULL)
                                  OR (
                                    TRIM(
                                      BOTH
                                      FROM
                                        bfa.status
                                    ) = ''::text
                                  )
                                ) THEN 'Unknown'::text
                                ELSE initcap(
                                  TRIM(
                                    BOTH
                                    FROM
                                      bfa.status
                                  )
                                )
                              END,
                              'type',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    (bfa.accused_type)::text
                                ),
                                ''::text
                              ),
                              'value',
                              concat_ws(
                                ' '::text,
                                CASE
                                  WHEN (
                                    NULLIF(
                                      TRIM(
                                        BOTH
                                        FROM
                                          a.accused_code
                                      ),
                                      ''::text
                                    ) IS NOT NULL
                                  ) THEN (
                                    TRIM(
                                      BOTH
                                      FROM
                                        a.accused_code
                                    ) || ':'::text
                                  )
                                  ELSE NULL::text
                                END,
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      COALESCE(p.full_name, p.name)
                                  ),
                                  ''::text
                                ),
                                CASE
                                  WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                                  WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                  WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                                  WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                                  WHEN (
                                    NULLIF(
                                      TRIM(
                                        BOTH
                                        FROM
                                          bfa.status
                                      ),
                                      ''::text
                                    ) IS NOT NULL
                                  ) THEN (
                                    (
                                      '('::text || initcap(
                                        TRIM(
                                          BOTH
                                          FROM
                                            bfa.status
                                        )
                                      )
                                    ) || ')'::text
                                  )
                                  ELSE NULL::text
                                END
                              ),
                              'houseNo',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_house_no
                                ),
                                ''::text
                              ),
                              'streetRoadNo',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_street_road_no
                                ),
                                ''::text
                              ),
                              'wardColony',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_ward_colony
                                ),
                                ''::text
                              ),
                              'landmarkMilestone',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_landmark_milestone
                                ),
                                ''::text
                              ),
                              'localityVillage',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_locality_village
                                ),
                                ''::text
                              ),
                              'areaMandal',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_area_mandal
                                ),
                                ''::text
                              ),
                              'district',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_district
                                ),
                                ''::text
                              ),
                              'stateUT',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_state_ut
                                ),
                                ''::text
                              ),
                              'country',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_country
                                ),
                                ''::text
                              ),
                              'residencyType',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_residency_type
                                ),
                                ''::text
                              ),
                              'pinCode',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_pin_code
                                ),
                                ''::text
                              ),
                              'jurisdictionPS',
                              NULLIF(
                                TRIM(
                                  BOTH
                                  FROM
                                    p.permanent_jurisdiction_ps
                                ),
                                ''::text
                              )
                            )
                          ) AS details
                        FROM
                          (
                            (
                              (
                                (
                                  accused a
                                  LEFT JOIN agent_deduplication_tracker adt ON (((a.person_id)::text = ANY (adt.all_person_ids)))
                                )
                                LEFT JOIN persons p ON (((p.person_id)::text = (a.person_id)::text))
                              )
                              LEFT JOIN arrests ar ON (
                                (
                                  ((ar.crime_id)::text = (a.crime_id)::text)
                                  AND (ar.accused_seq_no = (a.seq_num)::text)
                                )
                              )
                            )
                            LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
                          )
                        GROUP BY
                          a.crime_id
                      ) accused_details ON (
                        (
                          (accused_details.crime_id)::text = (c.crime_id)::text
                        )
                      )
                    )
                    LEFT JOIN (
                      SELECT
                        p.crime_id,
                        jsonb_agg(
                          jsonb_build_object(
                            'id',
                            p.property_id,
                            'propertyStatus',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.property_status)::text
                              ),
                              ''::text
                            ),
                            'recoveredFrom',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.recovered_from)::text
                              ),
                              ''::text
                            ),
                            'placeOfRecovery',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  p.place_of_recovery
                              ),
                              ''::text
                            ),
                            'dateOfSeizure',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.date_of_seizure)::text
                              ),
                              ''::text
                            ),
                            'nature',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.nature)::text
                              ),
                              ''::text
                            ),
                            'belongs',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.belongs)::text
                              ),
                              ''::text
                            ),
                            'estimatedValue',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.estimate_value)::text
                              ),
                              ''::text
                            ),
                            'recoveredValue',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.recovered_value)::text
                              ),
                              ''::text
                            ),
                            'particularOfProperty',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  p.particular_of_property
                              ),
                              ''::text
                            ),
                            'category',
                            NULLIF(
                              TRIM(
                                BOTH
                                FROM
                                  (p.category)::text
                              ),
                              ''::text
                            )
                          )
                        ) AS details
                      FROM
                        properties p
                      WHERE
                        (
                          TRIM(
                            BOTH
                            FROM
                              p.property_status
                          ) <> 'Seized'::text
                        )
                      GROUP BY
                        p.crime_id
                    ) property_details ON (
                      (
                        (property_details.crime_id)::text = (c.crime_id)::text
                      )
                    )
                  )
                  LEFT JOIN (
                    SELECT
                      bfd.crime_id,
                      array_agg(
                        DISTINCT NULLIF(
                          TRIM(
                            BOTH
                            FROM
                              bfd.primary_drug_name
                          ),
                          ''::text
                        )
                      ) AS TYPES
                    FROM
                      brief_facts_drug bfd
                    WHERE
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            bfd.primary_drug_name
                        ),
                        ''::text
                      ) IS NOT NULL
                      AND (bfd.primary_drug_name)::text <> 'NO_DRUGS_DETECTED'::text
                    GROUP BY
                      bfd.crime_id
                  ) drug_types ON (
                    ((drug_types.crime_id)::text = (c.crime_id)::text)
                  )
                )
                LEFT JOIN (
                  SELECT
                    bfd.crime_id,
                    jsonb_agg(
                      jsonb_build_object(
                        'name',
                        bfd.primary_drug_name,
                        'quantity',
                        NULLIF(
                          concat_ws(
                            ', '::text,
                            CASE
                              WHEN (
                                (bfd.standardized_weight_kg IS NOT NULL)
                                AND (bfd.standardized_weight_kg <> (0)::numeric)
                              ) THEN concat(
                                TRIM(
                                  BOTH
                                  FROM
                                    (round(bfd.standardized_weight_kg, 2))::text
                                ),
                                ' Kg'
                              )
                              ELSE NULL::text
                            END,
                            CASE
                              WHEN (
                                (bfd.standardized_volume_ml IS NOT NULL)
                                AND (bfd.standardized_volume_ml <> (0)::numeric)
                              ) THEN concat(
                                TRIM(
                                  BOTH
                                  FROM
                                    (round(bfd.standardized_volume_ml, 2))::text
                                ),
                                ' L'
                              )
                              ELSE NULL::text
                            END,
                            CASE
                              WHEN (
                                (bfd.standardized_count IS NOT NULL)
                                AND (bfd.standardized_count <> (0)::numeric)
                              ) THEN concat(
                                TRIM(
                                  BOTH
                                  FROM
                                    (round(bfd.standardized_count, 2))::text
                                ),
                                ' Packets/Pills'
                              )
                              ELSE NULL::text
                            END
                          ),
                          ''::text
                        ),
                        'worth',
                        round(bfd.seizure_worth * (10000000)::numeric, 2)
                      )
                    ) AS TYPES
                  FROM
                    brief_facts_drug bfd
                  WHERE
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          bfd.primary_drug_name
                      ),
                      ''::text
                    ) IS NOT NULL
                    AND (bfd.primary_drug_name)::text <> 'NO_DRUGS_DETECTED'::text
                  GROUP BY
                    bfd.crime_id
                ) drug_quantities ON (
                  (drug_quantities.crime_id)::text = (c.crime_id)::text
                )
              )
              LEFT JOIN (
                SELECT
                  f.parent_id AS crime_id,
                  max((f.file_url)::text) AS file_url
                FROM
                  files f
                WHERE
                  (
                    ((f.source_type)::text = 'crime'::text)
                    AND ((f.source_field)::text = 'FIR_COPY'::text)
                  )
                GROUP BY
                  f.parent_id
              ) fir_copy_file ON (
                (
                  (fir_copy_file.crime_id)::text = (c.crime_id)::text
                )
              )
            )
            LEFT JOIN (
              SELECT
                f.parent_id AS crime_id,
                jsonb_agg(
                  jsonb_build_object('name', f.notes, 'link', f.file_url)
                ) FILTER (
                  WHERE
                    (f.file_url IS NOT NULL)
                ) AS docs
              FROM
                files f
              WHERE
                (
                  ((f.source_type)::text = 'crime'::text)
                  AND ((f.source_field)::text = 'MEDIA'::text)
                )
              GROUP BY
                f.parent_id
            ) crime_documents ON (
              (
                (crime_documents.crime_id)::text = (c.crime_id)::text
              )
            )
          )
          LEFT JOIN (
            SELECT
              ms.crime_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ms.mo_seizure_id,
                  'seqNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.seq_no
                    ),
                    ''::text
                  ),
                  'moId',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.mo_id
                    ),
                    ''::text
                  ),
                  'type',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        (ms.type)::text
                    ),
                    ''::text
                  ),
                  'subType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.sub_type
                    ),
                    ''::text
                  ),
                  'description',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.description
                    ),
                    ''::text
                  ),
                  'seizedFrom',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.seized_from
                    ),
                    ''::text
                  ),
                  'seizedAt',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        (ms.seized_at)::text
                    ),
                    ''::text
                  ),
                  'seizedBy',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.seized_by
                    ),
                    ''::text
                  ),
                  'strengthOfEvidence',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.strength_of_evidence
                    ),
                    ''::text
                  ),
                  'posAddress1',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_address1
                    ),
                    ''::text
                  ),
                  'posAddress2',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_address2
                    ),
                    ''::text
                  ),
                  'posCity',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_city
                    ),
                    ''::text
                  ),
                  'posDistrict',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_district
                    ),
                    ''::text
                  ),
                  'posPincode',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_pincode
                    ),
                    ''::text
                  ),
                  'posLandmark',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_landmark
                    ),
                    ''::text
                  ),
                  'posDescription',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_description
                    ),
                    ''::text
                  ),
                  'posLatitude',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_latitude
                    ),
                    ''::text
                  ),
                  'posLongitude',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.pos_longitude
                    ),
                    ''::text
                  ),
                  'moMediaUrl',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.mo_media_url
                    ),
                    ''::text
                  ),
                  'moMediaName',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.mo_media_name
                    ),
                    ''::text
                  ),
                  'moMediaFileId',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ms.mo_media_file_id
                    ),
                    ''::text
                  )
                )
              ) AS details
            FROM
              mo_seizures ms
            GROUP BY
              ms.crime_id
          ) mo_seizures_details ON (
            (
              (mo_seizures_details.crime_id)::text = (c.crime_id)::text
            )
          )
        )
        LEFT JOIN (
          SELECT
            p.crime_id,
            jsonb_agg(
              jsonb_build_object('type', f.source_field, 'link', f.file_url)
            ) FILTER (
              WHERE
                (f.file_url IS NOT NULL)
            ) AS docs
          FROM
            (
              properties p
              JOIN files f ON (
                (
                  ((f.parent_id)::text = (p.property_id)::text)
                  AND ((f.source_type)::text = 'property'::text)
                )
              )
            )
          GROUP BY
            p.crime_id
        ) property_documents ON (
          (
            (property_documents.crime_id)::text = (c.crime_id)::text
          )
        )
      )
      LEFT JOIN (
        SELECT
          ir.crime_id,
          jsonb_agg(
            jsonb_build_object('type', f.source_field, 'link', f.file_url)
          ) FILTER (
            WHERE
              (f.file_url IS NOT NULL)
          ) AS docs
        FROM
          (
            interrogation_reports ir
            JOIN files f ON (
              (
                (
                  (f.parent_id)::text = (ir.interrogation_report_id)::text
                )
                AND ((f.source_type)::text = 'interrogation'::text)
              )
            )
          )
        GROUP BY
          ir.crime_id
      ) ir_documents ON (
        (
          (ir_documents.crime_id)::text = (c.crime_id)::text
        )
      )
    )
    LEFT JOIN (
      SELECT
        cs.crime_id,
        jsonb_agg(
          jsonb_build_object(
            'id',
            cs.id,
            'chargesheetNo',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  cs.chargesheet_no
              ),
              ''::text
            ),
            'chargesheetNoIcjs',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  cs.chargesheet_no_icjs
              ),
              ''::text
            ),
            'chargesheetDate',
            cs.chargesheet_date,
            'chargesheetType',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  cs.chargesheet_type
              ),
              ''::text
            ),
            'courtName',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  cs.court_name
              ),
              ''::text
            ),
            'isCcl',
            cs.is_ccl,
            'isEsigned',
            cs.is_esigned,
            'dateCreated',
            cs.date_created,
            'dateModified',
            cs.date_modified,
            'acts',
            COALESCE(cs_acts.acts, '[]'::jsonb),
            'accuseds',
            COALESCE(cs_accuseds.accuseds, '[]'::jsonb)
          )
        ) AS chargesheets
      FROM
        (
          (
            chargesheets cs
            LEFT JOIN (
              SELECT
                ca.chargesheet_id,
                jsonb_agg(
                  jsonb_build_object(
                    'id',
                    ca.id,
                    'actDescription',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          ca.act_description
                      ),
                      ''::text
                    ),
                    'section',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          ca.section
                      ),
                      ''::text
                    ),
                    'rwRequired',
                    ca.rw_required,
                    'sectionDescription',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          ca.section_description
                      ),
                      ''::text
                    ),
                    'graveParticulars',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          ca.grave_particulars
                      ),
                      ''::text
                    ),
                    'createdAt',
                    ca.created_at
                  )
                ) AS acts
              FROM
                chargesheet_acts ca
              GROUP BY
                ca.chargesheet_id
            ) cs_acts ON (((cs_acts.chargesheet_id)::text = (cs.id)::text))
          )
          LEFT JOIN (
            SELECT
              csa.chargesheet_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  csa.id,
                  'personId',
                  csa.accused_person_id,
                  'chargeStatus',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        csa.charge_status
                    ),
                    ''::text
                  ),
                  'requestedForNbw',
                  csa.requested_for_nbw,
                  'reasonForNoCharge',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        csa.reason_for_no_charge
                    ),
                    ''::text
                  ),
                  'isPersonMasterPresent',
                  csa.is_person_master_present,
                  'createdAt',
                  csa.created_at,
                  'value',
                  concat_ws(
                    ' '::text,
                    CASE
                      WHEN (
                        (a.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                a.accused_code
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        TRIM(
                          BOTH
                          FROM
                            a.accused_code
                        ) || ':'::text
                      )
                      ELSE NULL::text
                    END,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        (
                          '('::text || initcap(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            )
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS accuseds
            FROM
              (
                (
                  (
                    (
                      (
                        (
                          chargesheet_accused csa
                          JOIN chargesheets cs_acc ON (((cs_acc.id)::text = (csa.chargesheet_id)::text))
                        )
                        LEFT JOIN agent_deduplication_tracker adt_cs ON (
                          (
                            (csa.accused_person_id)::text = ANY (adt_cs.all_person_ids)
                          )
                        )
                      )
                      LEFT JOIN persons p ON (
                        (
                          (p.person_id)::text = (csa.accused_person_id)::text
                        )
                      )
                    )
                    LEFT JOIN accused a ON (
                      (
                        (
                          (a.person_id)::text = (csa.accused_person_id)::text
                        )
                        AND ((a.crime_id)::text = (cs_acc.crime_id)::text)
                      )
                    )
                  )
                  LEFT JOIN arrests ar ON (
                    (
                      ((ar.crime_id)::text = (a.crime_id)::text)
                      AND (ar.accused_seq_no = (a.seq_num)::text)
                    )
                  )
                )
                LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
              )
            GROUP BY
              csa.chargesheet_id
          ) cs_accuseds ON (
            (
              (cs_accuseds.chargesheet_id)::text = (cs.id)::text
            )
          )
        )
      GROUP BY
        cs.crime_id
    ) chargesheets_data ON (
      (
        (chargesheets_data.crime_id)::text = (c.crime_id)::text
      )
    )
  )
  LEFT JOIN (
    SELECT
      d.crime_id,
      jsonb_agg(
        jsonb_build_object(
          'id',
          d.id,
          'disposalType',
          NULLIF(
            TRIM(
              BOTH
              FROM
                d.disposal_type
            ),
            ''::text
          ),
          'disposedAt',
          d.disposed_at,
          'disposal',
          NULLIF(
            TRIM(
              BOTH
              FROM
                d.disposal
            ),
            ''::text
          ),
          'caseStatus',
          NULLIF(
            TRIM(
              BOTH
              FROM
                d.case_status
            ),
            ''::text
          ),
          'dateCreated',
          d.date_created,
          'dateModified',
          d.date_modified
        )
      ) AS details
    FROM
      disposal d
    GROUP BY
      d.crime_id
  ) disposal_details ON (
    (
      (disposal_details.crime_id)::text = (c.crime_id)::text
    )
  )
  LEFT JOIN (
    SELECT
      base.crime_id,
      jsonb_agg(
        (
          jsonb_build_object(
            'id',
            base.interrogation_report_id,
            'personId',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  (base.person_id)::text
              ),
              ''::text
            ),
            'value',
            base.person_value,
            'physicalBeard',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_beard
              ),
              ''::text
            ),
            'physicalBuild',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_build
              ),
              ''::text
            ),
            'physicalBurnMarks',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_burn_marks
              ),
              ''::text
            ),
            'physicalColor',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_color
              ),
              ''::text
            ),
            'physicalDeformitiesOrPeculiarities',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_deformities_or_peculiarities
              ),
              ''::text
            ),
            'physicalDeformities',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_deformities
              ),
              ''::text
            ),
            'physicalEar',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_ear
              ),
              ''::text
            ),
            'physicalEyes',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_eyes
              ),
              ''::text
            ),
            'physicalFace',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_face
              ),
              ''::text
            ),
            'physicalHair',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_hair
              ),
              ''::text
            ),
            'physicalHeight',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_height
              ),
              ''::text
            ),
            'physicalIdentificationMarks',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_identification_marks
              ),
              ''::text
            ),
            'physicalLanguageOrDialect',
            base.physical_language_or_dialect,
            'physicalLeucoderma',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_leucoderma
              ),
              ''::text
            ),
            'physicalMole',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_mole
              ),
              ''::text
            ),
            'physicalMustache',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_mustache
              ),
              ''::text
            ),
            'physicalNose',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_nose
              ),
              ''::text
            ),
            'physicalScar',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_scar
              ),
              ''::text
            ),
            'physicalTattoo',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_tattoo
              ),
              ''::text
            ),
            'physicalTeeth',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.physical_teeth
              ),
              ''::text
            ),
            'socioLivingStatus',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.socio_living_status
              ),
              ''::text
            ),
            'socioMaritalStatus',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.socio_marital_status
              ),
              ''::text
            ),
            'socioEducation',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.socio_education
              ),
              ''::text
            ),
            'socioOccupation',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.socio_occupation
              ),
              ''::text
            ),
            'socioIncomeGroup',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.socio_income_group
              ),
              ''::text
            )
          ) || jsonb_build_object(
            'offenceTime',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.offence_time
              ),
              ''::text
            ),
            'otherOffenceTime',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.other_offence_time
              ),
              ''::text
            ),
            'shareOfAmountSpent',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.share_of_amount_spent
              ),
              ''::text
            ),
            'otherShareOfAmountSpent',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.other_share_of_amount_spent
              ),
              ''::text
            ),
            'shareRemarks',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.share_remarks
              ),
              ''::text
            ),
            'isInJail',
            base.is_in_jail,
            'fromWhereSentInJail',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.from_where_sent_in_jail
              ),
              ''::text
            ),
            'inJailCrimeNum',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.in_jail_crime_num
              ),
              ''::text
            ),
            'inJailDistUnit',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.in_jail_dist_unit
              ),
              ''::text
            ),
            'isOnBail',
            base.is_on_bail,
            'fromWhereSentOnBail',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.from_where_sent_on_bail
              ),
              ''::text
            ),
            'onBailCrimeNum',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.on_bail_crime_num
              ),
              ''::text
            ),
            'dateOfBail',
            base.date_of_bail,
            'isAbsconding',
            base.is_absconding,
            'wantedInPoliceStation',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.wanted_in_police_station
              ),
              ''::text
            ),
            'abscondingCrimeNum',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.absconding_crime_num
              ),
              ''::text
            )
          ) || jsonb_build_object(
            'isNormalLife',
            base.is_normal_life,
            'ekingLivelihoodByLaborWork',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.eking_livelihood_by_labor_work
              ),
              ''::text
            ),
            'isRehabilitated',
            base.is_rehabilitated,
            'rehabilitationDetails',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.rehabilitation_details
              ),
              ''::text
            ),
            'isDead',
            base.is_dead,
            'deathDetails',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.death_details
              ),
              ''::text
            ),
            'isFacingTrial',
            base.is_facing_trial,
            'facingTrialPsName',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.facing_trial_ps_name
              ),
              ''::text
            ),
            'facingTrialCrimeNum',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.facing_trial_crime_num
              ),
              ''::text
            ),
            'otherRegularHabits',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.other_regular_habits
              ),
              ''::text
            ),
            'otherIndulgenceBeforeOffence',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.other_indulgence_before_offence
              ),
              ''::text
            ),
            'timeSinceModusOperandi',
            NULLIF(
              TRIM(
                BOTH
                FROM
                  base.time_since_modus_operandi
              ),
              ''::text
            ),
            'dateCreated',
            base.date_created,
            'dateModified',
            base.date_modified,
            'familyMembers',
            base.family_members,
            'associateDetails',
            base.associate_details,
            'consumerDetails',
            base.consumer_details,
            'defenceCounsel',
            base.defence_counsel,
            'dopamsLinks',
            base.dopams_links,
            'familyHistory',
            base.family_history,
            'financialHistory',
            base.financial_history,
            'localContacts',
            base.local_contacts,
            'modusOperandi',
            base.modus_operandi,
            'previousOffencesConfessed',
            base.previous_offences_confessed,
            'regularHabits',
            base.regular_habits,
            'shelter',
            base.shelter,
            'simDetails',
            base.sim_details,
            'typesOfDrugs',
            base.types_of_drugs
          )
        )
      ) AS details
    FROM
      (
        SELECT
          ir.crime_id,
          (ir.interrogation_report_id)::text AS interrogation_report_id,
          ir.person_id,
          concat_ws(
            ' '::text,
            NULLIF(
              TRIM(
                BOTH
                FROM
                  COALESCE(p_ir.full_name, p_ir.name)
              ),
              ''::text
            ),
            CASE
              WHEN (ar_ir.is_arrested IS TRUE) THEN '(Arrested)'::text
              WHEN (ar_ir.is_apprehended IS TRUE) THEN '(Apprehended)'::text
              WHEN (ar_ir.is_absconding IS TRUE) THEN '(Absconding)'::text
              WHEN (ar_ir.is_died IS TRUE) THEN '(Died)'::text
              WHEN (
                (bfa_ir.accused_id IS NOT NULL)
                AND (
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        bfa_ir.status
                    ),
                    ''::text
                  ) IS NOT NULL
                )
              ) THEN (
                '(' || initcap(
                  TRIM(
                    BOTH
                    FROM
                      bfa_ir.status
                  )
                ) || ')'::text
              )
              ELSE NULL::text
            END
          ) AS person_value,
          ir.physical_beard,
          ir.physical_build,
          ir.physical_burn_marks,
          ir.physical_color,
          ir.physical_deformities_or_peculiarities,
          ir.physical_deformities,
          ir.physical_ear,
          ir.physical_eyes,
          ir.physical_face,
          ir.physical_hair,
          ir.physical_height,
          ir.physical_identification_marks,
          ir.physical_language_or_dialect,
          ir.physical_leucoderma,
          ir.physical_mole,
          ir.physical_mustache,
          ir.physical_nose,
          ir.physical_scar,
          ir.physical_tattoo,
          ir.physical_teeth,
          ir.socio_living_status,
          ir.socio_marital_status,
          ir.socio_education,
          ir.socio_occupation,
          ir.socio_income_group,
          ir.offence_time,
          ir.other_offence_time,
          ir.share_of_amount_spent,
          ir.other_share_of_amount_spent,
          ir.share_remarks,
          ir.is_in_jail,
          ir.from_where_sent_in_jail,
          ir.in_jail_crime_num,
          ir.in_jail_dist_unit,
          ir.is_on_bail,
          ir.from_where_sent_on_bail,
          ir.on_bail_crime_num,
          ir.date_of_bail,
          ir.is_absconding,
          ir.wanted_in_police_station,
          ir.absconding_crime_num,
          ir.is_normal_life,
          ir.eking_livelihood_by_labor_work,
          ir.is_rehabilitated,
          ir.rehabilitation_details,
          ir.is_dead,
          ir.death_details,
          ir.is_facing_trial,
          ir.facing_trial_ps_name,
          ir.facing_trial_crime_num,
          ir.other_regular_habits,
          ir.other_indulgence_before_offence,
          ir.time_since_modus_operandi,
          ir.date_created,
          ir.date_modified,
          NULL::jsonb AS family_members,
          COALESCE(associate_details_agg_ir.details, '[]'::jsonb) AS associate_details,
          COALESCE(consumer_details_agg_ir.details, '[]'::jsonb) AS consumer_details,
          COALESCE(defence_counsel_agg_ir.details, '[]'::jsonb) AS defence_counsel,
          COALESCE(dopams_links_agg_ir.details, '[]'::jsonb) AS dopams_links,
          COALESCE(family_history_agg_ir.details, '[]'::jsonb) AS family_history,
          COALESCE(financial_history_agg_ir.details, '[]'::jsonb) AS financial_history,
          COALESCE(local_contacts_agg_ir.details, '[]'::jsonb) AS local_contacts,
          COALESCE(modus_operandi_agg_ir.details, '[]'::jsonb) AS modus_operandi,
          COALESCE(
            previous_offences_confessed_agg_ir.details,
            '[]'::jsonb
          ) AS previous_offences_confessed,
          COALESCE(regular_habits_agg_ir.details, '[]'::jsonb) AS regular_habits,
          COALESCE(shelter_agg_ir.details, '[]'::jsonb) AS shelter,
          COALESCE(sim_details_agg_ir.details, '[]'::jsonb) AS sim_details,
          COALESCE(types_of_drugs_agg_ir.details, '[]'::jsonb) AS types_of_drugs
        FROM
          interrogation_reports ir
          LEFT JOIN agent_deduplication_tracker adt_ir ON (
            (ir.person_id)::text = ANY (adt_ir.all_person_ids)
          )
          LEFT JOIN persons p_ir ON ((p_ir.person_id)::text = (ir.person_id)::text)
          LEFT JOIN accused a_ir ON (
            ((a_ir.person_id)::text = (ir.person_id)::text)
            AND ((a_ir.crime_id)::text = (ir.crime_id)::text)
          )
          LEFT JOIN arrests ar_ir ON (
            ((ar_ir.crime_id)::text = (a_ir.crime_id)::text)
            AND (ar_ir.accused_seq_no = (a_ir.seq_num)::text)
          )
          LEFT JOIN brief_facts_accused bfa_ir ON (
            (
              (bfa_ir.accused_id)::text = (a_ir.accused_id)::text
            )
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  iad.id,
                  'personId',
                  iad.person_id,
                  'gang',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        iad.gang
                    ),
                    ''::text
                  ),
                  'relation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        iad.relation
                    ),
                    ''::text
                  ),
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_associate_details iad
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (iad.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON ((iad.person_id)::text = ANY (adt.all_person_ids))
              LEFT JOIN persons p ON ((p.person_id)::text = (iad.person_id)::text)
              LEFT JOIN accused a ON (
                ((a.person_id)::text = (iad.person_id)::text)
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) associate_details_agg_ir ON (
            (
              (associate_details_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              associate_details_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  icd.id,
                  'consumerPersonId',
                  icd.consumer_person_id,
                  'placeOfConsumption',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        icd.place_of_consumption
                    ),
                    ''::text
                  ),
                  'otherSources',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        icd.other_sources
                    ),
                    ''::text
                  ),
                  'otherSourcesPhoneNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        icd.other_sources_phone_no
                    ),
                    ''::text
                  ),
                  'aadharCardNumber',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        icd.aadhar_card_number
                    ),
                    ''::text
                  ),
                  'aadharCardNumberPhoneNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        icd.aadhar_card_number_phone_no
                    ),
                    ''::text
                  ),
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_consumer_details icd
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (icd.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON (
                (icd.consumer_person_id)::text = ANY (adt.all_person_ids)
              )
              LEFT JOIN persons p ON (
                (p.person_id)::text = (icd.consumer_person_id)::text
              )
              LEFT JOIN accused a ON (
                (
                  (a.person_id)::text = (icd.consumer_person_id)::text
                )
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) consumer_details_agg_ir ON (
            (
              (consumer_details_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              consumer_details_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  idc.id,
                  'distDivision',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.dist_division
                    ),
                    ''::text
                  ),
                  'psCode',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.ps_code
                    ),
                    ''::text
                  ),
                  'crimeNum',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.crime_num
                    ),
                    ''::text
                  ),
                  'lawSection',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.law_section
                    ),
                    ''::text
                  ),
                  'scCcNum',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.sc_cc_num
                    ),
                    ''::text
                  ),
                  'defenceCounselAddress',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.defence_counsel_address
                    ),
                    ''::text
                  ),
                  'defenceCounselPhone',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.defence_counsel_phone
                    ),
                    ''::text
                  ),
                  'assistance',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idc.assistance
                    ),
                    ''::text
                  ),
                  'defenceCounselPersonId',
                  idc.defence_counsel_person_id,
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_defence_counsel idc
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (idc.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON (
                (idc.defence_counsel_person_id)::text = ANY (adt.all_person_ids)
              )
              LEFT JOIN persons p ON (
                (p.person_id)::text = (idc.defence_counsel_person_id)::text
              )
              LEFT JOIN accused a ON (
                (
                  (a.person_id)::text = (idc.defence_counsel_person_id)::text
                )
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) defence_counsel_agg_ir ON (
            (
              (defence_counsel_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              defence_counsel_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  idl.id,
                  'phoneNumber',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        idl.phone_number
                    ),
                    ''::text
                  ),
                  'dopamsData',
                  CASE
                    WHEN idl.dopams_data IS NULL THEN NULL::jsonb
                    WHEN array_length(idl.dopams_data, 1) IS NULL THEN '[]'::jsonb
                    ELSE to_jsonb(idl.dopams_data)::jsonb
                  END
                )
              ) AS details
            FROM
              ir_dopams_links idl
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (idl.interrogation_report_id)::text
              )
            GROUP BY
              ir_agg.interrogation_report_id
          ) dopams_links_agg_ir ON (
            (
              (dopams_links_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              dopams_links_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ifh.id,
                  'personId',
                  ifh.person_id,
                  'relation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifh.relation
                    ),
                    ''::text
                  ),
                  'familyMemberPeculiarity',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifh.family_member_peculiarity
                    ),
                    ''::text
                  ),
                  'criminalBackground',
                  ifh.criminal_background,
                  'isAlive',
                  ifh.is_alive,
                  'familyStayTogether',
                  ifh.family_stay_together,
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_family_history ifh
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (ifh.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON ((ifh.person_id)::text = ANY (adt.all_person_ids))
              LEFT JOIN persons p ON ((p.person_id)::text = (ifh.person_id)::text)
              LEFT JOIN accused a ON (
                ((a.person_id)::text = (ifh.person_id)::text)
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) family_history_agg_ir ON (
            (
              (family_history_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              family_history_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ifin.id,
                  'accountHolderPersonId',
                  ifin.account_holder_person_id,
                  'panNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.pan_no
                    ),
                    ''::text
                  ),
                  'upiId',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.upi_id
                    ),
                    ''::text
                  ),
                  'nameOfBank',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.name_of_bank
                    ),
                    ''::text
                  ),
                  'accountNumber',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.account_number
                    ),
                    ''::text
                  ),
                  'branchName',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.branch_name
                    ),
                    ''::text
                  ),
                  'ifscCode',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.ifsc_code
                    ),
                    ''::text
                  ),
                  'immovablePropertyAcquired',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.immovable_property_acquired
                    ),
                    ''::text
                  ),
                  'movablePropertyAcquired',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ifin.movable_property_acquired
                    ),
                    ''::text
                  ),
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_financial_history ifin
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (ifin.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON (
                (ifin.account_holder_person_id)::text = ANY (adt.all_person_ids)
              )
              LEFT JOIN persons p ON (
                (p.person_id)::text = (ifin.account_holder_person_id)::text
              )
              LEFT JOIN accused a ON (
                (
                  (a.person_id)::text = (ifin.account_holder_person_id)::text
                )
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) financial_history_agg_ir ON (
            (
              (financial_history_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              financial_history_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ilc.id,
                  'personId',
                  ilc.person_id,
                  'town',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ilc.town
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ilc.address
                    ),
                    ''::text
                  ),
                  'jurisdictionPs',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ilc.jurisdiction_ps
                    ),
                    ''::text
                  ),
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_local_contacts ilc
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (ilc.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON ((ilc.person_id)::text = ANY (adt.all_person_ids))
              LEFT JOIN persons p ON ((p.person_id)::text = (ilc.person_id)::text)
              LEFT JOIN accused a ON (
                ((a.person_id)::text = (ilc.person_id)::text)
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) local_contacts_agg_ir ON (
            (
              (local_contacts_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              local_contacts_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  imo.id,
                  'crimeHead',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        imo.crime_head
                    ),
                    ''::text
                  ),
                  'crimeSubHead',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        imo.crime_sub_head
                    ),
                    ''::text
                  ),
                  'modusOperandi',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        imo.modus_operandi
                    ),
                    ''::text
                  )
                )
              ) AS details
            FROM
              ir_modus_operandi imo
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (imo.interrogation_report_id)::text
              )
            GROUP BY
              ir_agg.interrogation_report_id
          ) modus_operandi_agg_ir ON (
            (
              (modus_operandi_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              modus_operandi_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ipoc.id,
                  'arrestDate',
                  ipoc.arrest_date,
                  'arrestedBy',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.arrested_by
                    ),
                    ''::text
                  ),
                  'arrestPlace',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.arrest_place
                    ),
                    ''::text
                  ),
                  'crimeNum',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.crime_num
                    ),
                    ''::text
                  ),
                  'distUnitDivision',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.dist_unit_division
                    ),
                    ''::text
                  ),
                  'gangMember',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.gang_member
                    ),
                    ''::text
                  ),
                  'interrogatedBy',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.interrogated_by
                    ),
                    ''::text
                  ),
                  'lawSection',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.law_section
                    ),
                    ''::text
                  ),
                  'othersIdentify',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.others_identify
                    ),
                    ''::text
                  ),
                  'propertyRecovered',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.property_recovered
                    ),
                    ''::text
                  ),
                  'propertyStolen',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.property_stolen
                    ),
                    ''::text
                  ),
                  'psCode',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.ps_code
                    ),
                    ''::text
                  ),
                  'remarks',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ipoc.remarks
                    ),
                    ''::text
                  )
                )
              ) AS details
            FROM
              ir_previous_offences_confessed ipoc
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (ipoc.interrogation_report_id)::text
              )
            GROUP BY
              ir_agg.interrogation_report_id
          ) previous_offences_confessed_agg_ir ON (
            (
              (
                (
                  previous_offences_confessed_agg_ir.interrogation_report_id
                )::text = (ir.interrogation_report_id)::text
              )
              AND (
                previous_offences_confessed_agg_ir.interrogation_report_id IS NOT NULL
              )
              AND (ir.interrogation_report_id IS NOT NULL)
            )
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  irh.id,
                  'habit',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        irh.habit
                    ),
                    ''::text
                  )
                )
              ) AS details
            FROM
              ir_regular_habits irh
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (irh.interrogation_report_id)::text
              )
            GROUP BY
              ir_agg.interrogation_report_id
          ) regular_habits_agg_ir ON (
            (
              (regular_habits_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              regular_habits_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  ish.id,
                  'preparationOfOffence',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ish.preparation_of_offence
                    ),
                    ''::text
                  ),
                  'afterOffence',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ish.after_offence
                    ),
                    ''::text
                  ),
                  'regularResidency',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ish.regular_residency
                    ),
                    ''::text
                  ),
                  'remarks',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ish.remarks
                    ),
                    ''::text
                  ),
                  'otherRegularResidency',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        ish.other_regular_residency
                    ),
                    ''::text
                  )
                )
              ) AS details
            FROM
              ir_shelter ish
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (ish.interrogation_report_id)::text
              )
            GROUP BY
              ir_agg.interrogation_report_id
          ) shelter_agg_ir ON (
            (
              (shelter_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              shelter_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  isd.id,
                  'phoneNumber',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        isd.phone_number
                    ),
                    ''::text
                  ),
                  'sdr',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        isd.sdr
                    ),
                    ''::text
                  ),
                  'imei',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        isd.imei
                    ),
                    ''::text
                  ),
                  'trueCallerName',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        isd.true_caller_name
                    ),
                    ''::text
                  ),
                  'personId',
                  isd.person_id,
                  'value',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(p.full_name, p.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ar.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ar.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ar.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ar.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfa.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfa.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_sim_details isd
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (isd.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adt ON ((isd.person_id)::text = ANY (adt.all_person_ids))
              LEFT JOIN persons p ON ((p.person_id)::text = (isd.person_id)::text)
              LEFT JOIN accused a ON (
                ((a.person_id)::text = (isd.person_id)::text)
                AND ((a.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests ar ON (
                ((ar.crime_id)::text = (a.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) sim_details_agg_ir ON (
            (
              (sim_details_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              sim_details_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
          LEFT JOIN (
            SELECT
              ir_agg.interrogation_report_id,
              jsonb_agg(
                jsonb_build_object(
                  'id',
                  itod.id,
                  'typeOfDrug',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        itod.type_of_drug
                    ),
                    ''::text
                  ),
                  'quantity',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        itod.quantity
                    ),
                    ''::text
                  ),
                  'purchaseAmountInInr',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        itod.purchase_amount_in_inr
                    ),
                    ''::text
                  ),
                  'modeOfPayment',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        itod.mode_of_payment
                    ),
                    ''::text
                  ),
                  'modeOfTransport',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        itod.mode_of_transport
                    ),
                    ''::text
                  ),
                  'supplierPersonId',
                  itod.supplier_person_id,
                  'receiversPersonId',
                  itod.receivers_person_id,
                  'supplierValue',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(ps.full_name, ps.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (ars.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (ars.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (ars.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (ars.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfas.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfas.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfas.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  ),
                  'receiverValue',
                  concat_ws(
                    ' '::text,
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          COALESCE(pr.full_name, pr.name)
                      ),
                      ''::text
                    ),
                    CASE
                      WHEN (arr.is_arrested IS TRUE) THEN '(Arrested)'::text
                      WHEN (arr.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                      WHEN (arr.is_absconding IS TRUE) THEN '(Absconding)'::text
                      WHEN (arr.is_died IS TRUE) THEN '(Died)'::text
                      WHEN (
                        (bfar.accused_id IS NOT NULL)
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfar.status
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                      ) THEN (
                        '(' || initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfar.status
                          )
                        ) || ')'::text
                      )
                      ELSE NULL::text
                    END
                  )
                )
              ) AS details
            FROM
              ir_types_of_drugs itod
              JOIN interrogation_reports ir_agg ON (
                (ir_agg.interrogation_report_id)::text = (itod.interrogation_report_id)::text
              )
              LEFT JOIN agent_deduplication_tracker adts ON (
                (itod.supplier_person_id)::text = ANY (adts.all_person_ids)
              )
              LEFT JOIN persons ps ON (
                (ps.person_id)::text = (itod.supplier_person_id)::text
              )
              LEFT JOIN accused accused_supplier ON (
                (
                  (accused_supplier.person_id)::text = (itod.supplier_person_id)::text
                )
                AND (
                  (accused_supplier.crime_id)::text = (ir_agg.crime_id)::text
                )
              )
              LEFT JOIN arrests ars ON (
                (
                  (ars.crime_id)::text = (accused_supplier.crime_id)::text
                )
                AND (
                  ars.accused_seq_no = (accused_supplier.seq_num)::text
                )
              )
              LEFT JOIN brief_facts_accused bfas ON (
                (
                  (bfas.accused_id)::text = (accused_supplier.accused_id)::text
                )
              )
              LEFT JOIN agent_deduplication_tracker adtr ON (
                (itod.receivers_person_id)::text = ANY (adtr.all_person_ids)
              )
              LEFT JOIN persons pr ON (
                (pr.person_id)::text = (itod.receivers_person_id)::text
              )
              LEFT JOIN accused ar ON (
                (
                  (ar.person_id)::text = (itod.receivers_person_id)::text
                )
                AND ((ar.crime_id)::text = (ir_agg.crime_id)::text)
              )
              LEFT JOIN arrests arr ON (
                ((arr.crime_id)::text = (ar.crime_id)::text)
                AND (arr.accused_seq_no = (ar.seq_num)::text)
              )
              LEFT JOIN brief_facts_accused bfar ON (((bfar.accused_id)::text = (ar.accused_id)::text))
            GROUP BY
              ir_agg.interrogation_report_id
          ) types_of_drugs_agg_ir ON (
            (
              (types_of_drugs_agg_ir.interrogation_report_id)::text = (ir.interrogation_report_id)::text
            )
            AND (
              types_of_drugs_agg_ir.interrogation_report_id IS NOT NULL
            )
            AND (ir.interrogation_report_id IS NOT NULL)
          )
        UNION ALL
        SELECT
          oir.crime_id,
          (oir.interrogation_report_id)::text AS interrogation_report_id,
          NULL::text AS person_id,
          NULL::text AS person_value,
          NULL::text AS physical_beard,
          NULL::text AS physical_build,
          NULL::text AS physical_burn_marks,
          NULL::text AS physical_color,
          NULL::text AS physical_deformities_or_peculiarities,
          NULL::text AS physical_deformities,
          NULL::text AS physical_ear,
          NULL::text AS physical_eyes,
          NULL::text AS physical_face,
          NULL::text AS physical_hair,
          NULL::text AS physical_height,
          NULL::text AS physical_identification_marks,
          NULL::text[] AS physical_language_or_dialect,
          NULL::text AS physical_leucoderma,
          NULL::text AS physical_mole,
          NULL::text AS physical_mustache,
          NULL::text AS physical_nose,
          NULL::text AS physical_scar,
          NULL::text AS physical_tattoo,
          NULL::text AS physical_teeth,
          NULL::text AS socio_living_status,
          NULL::text AS socio_marital_status,
          NULL::text AS socio_education,
          NULL::text AS socio_occupation,
          NULL::text AS socio_income_group,
          NULL::text AS offence_time,
          NULL::text AS other_offence_time,
          NULL::text AS share_of_amount_spent,
          NULL::text AS other_share_of_amount_spent,
          NULL::text AS share_remarks,
          NULL::boolean AS is_in_jail,
          NULL::text AS from_where_sent_in_jail,
          NULL::text AS in_jail_crime_num,
          NULL::text AS in_jail_dist_unit,
          NULL::boolean AS is_on_bail,
          NULL::text AS from_where_sent_on_bail,
          NULL::text AS on_bail_crime_num,
          NULL::date AS date_of_bail,
          NULL::boolean AS is_absconding,
          NULL::text AS wanted_in_police_station,
          NULL::text AS absconding_crime_num,
          NULL::boolean AS is_normal_life,
          NULL::text AS eking_livelihood_by_labor_work,
          NULL::boolean AS is_rehabilitated,
          NULL::text AS rehabilitation_details,
          NULL::boolean AS is_dead,
          NULL::text AS death_details,
          NULL::boolean AS is_facing_trial,
          NULL::text AS facing_trial_ps_name,
          NULL::text AS facing_trial_crime_num,
          NULL::text AS other_regular_habits,
          NULL::text AS other_indulgence_before_offence,
          NULL::text AS time_since_modus_operandi,
          NULL::timestamp(6) AS date_created,
          NULL::timestamp(6) AS date_modified,
          (
            jsonb_build_object(
              'aunt',
              CASE
                WHEN (
                  (oir.int_aunt_name IS NOT NULL)
                  OR (oir.int_aunt_address IS NOT NULL)
                  OR (oir.int_aunt_mobile_no IS NOT NULL)
                  OR (oir.int_aunt_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_aunt_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_aunt_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_aunt_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_aunt_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_aunt
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'brother',
              CASE
                WHEN (
                  (oir.int_brother_name IS NOT NULL)
                  OR (oir.int_brother_address IS NOT NULL)
                  OR (oir.int_brother_mobile_no IS NOT NULL)
                  OR (oir.int_brother_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_brother_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_brother_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_brother_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_brother_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_brother
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'daughter',
              CASE
                WHEN (
                  (oir.int_daughter_name IS NOT NULL)
                  OR (oir.int_daughter_address IS NOT NULL)
                  OR (oir.int_daughter_mobile_no IS NOT NULL)
                  OR (oir.int_daughter_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_daughter_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_daughter_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_daughter_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_daughter_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_daughter
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'father',
              CASE
                WHEN (
                  (oir.int_father_name IS NOT NULL)
                  OR (oir.int_father_address IS NOT NULL)
                  OR (oir.int_father_mobile_no IS NOT NULL)
                  OR (oir.int_father_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_father_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_father_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_father_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_father_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULL::text
                )
                ELSE NULL::jsonb
              END
            ) || jsonb_build_object(
              'fatherInLaw',
              CASE
                WHEN (
                  (oir.int_fil_name IS NOT NULL)
                  OR (oir.int_fil_address IS NOT NULL)
                  OR (oir.int_fil_mobile_no IS NOT NULL)
                  OR (oir.int_fil_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_fil_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_fil_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_fil_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_fil_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_fil
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'friend',
              CASE
                WHEN (
                  (oir.int_friend_name IS NOT NULL)
                  OR (oir.int_friend_address IS NOT NULL)
                  OR (oir.int_friend_mobile_no IS NOT NULL)
                  OR (oir.int_friend_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_friend_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_friend_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_friend_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_friend_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_friend
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'motherInLaw',
              CASE
                WHEN (
                  (oir.int_mil_name IS NOT NULL)
                  OR (oir.int_mil_address IS NOT NULL)
                  OR (oir.int_mil_mobile_no IS NOT NULL)
                  OR (oir.int_mil_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mil_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mil_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mil_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mil_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_mil
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'mother',
              CASE
                WHEN (
                  (oir.int_mother_name IS NOT NULL)
                  OR (oir.int_mother_address IS NOT NULL)
                  OR (oir.int_mother_mobile_no IS NOT NULL)
                  OR (oir.int_mother_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mother_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mother_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mother_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_mother_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_mother
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END
            ) || jsonb_build_object(
              'sister',
              CASE
                WHEN (
                  (oir.int_sister_name IS NOT NULL)
                  OR (oir.int_sister_address IS NOT NULL)
                  OR (oir.int_sister_mobile_no IS NOT NULL)
                  OR (oir.int_sister_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_sister_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_sister_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_sister_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_sister_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_sister
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'son',
              CASE
                WHEN (
                  (oir.int_son_name IS NOT NULL)
                  OR (oir.int_son_address IS NOT NULL)
                  OR (oir.int_son_mobile_no IS NOT NULL)
                  OR (oir.int_son_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_son_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_son_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_son_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_son_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_son
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'uncle',
              CASE
                WHEN (
                  (oir.int_uncle_name IS NOT NULL)
                  OR (oir.int_uncle_address IS NOT NULL)
                  OR (oir.int_uncle_mobile_no IS NOT NULL)
                  OR (oir.int_uncle_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_uncle_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_uncle_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_uncle_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_uncle_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_uncle
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END,
              'wife',
              CASE
                WHEN (
                  (oir.int_wife_name IS NOT NULL)
                  OR (oir.int_wife_address IS NOT NULL)
                  OR (oir.int_wife_mobile_no IS NOT NULL)
                  OR (oir.int_wife_occupation IS NOT NULL)
                ) THEN jsonb_build_object(
                  'name',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_wife_name
                    ),
                    ''::text
                  ),
                  'address',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_wife_address
                    ),
                    ''::text
                  ),
                  'mobileNo',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_wife_mobile_no
                    ),
                    ''::text
                  ),
                  'occupation',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_wife_occupation
                    ),
                    ''::text
                  ),
                  'relationType',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        oir.int_relation_type_wife
                    ),
                    ''::text
                  )
                )
                ELSE NULL::jsonb
              END
            )
          ) AS family_members,
          '[]'::jsonb AS associate_details,
          '[]'::jsonb AS consumer_details,
          '[]'::jsonb AS defence_counsel,
          '[]'::jsonb AS dopams_links,
          '[]'::jsonb AS family_history,
          '[]'::jsonb AS financial_history,
          '[]'::jsonb AS local_contacts,
          '[]'::jsonb AS modus_operandi,
          '[]'::jsonb AS previous_offences_confessed,
          '[]'::jsonb AS regular_habits,
          '[]'::jsonb AS shelter,
          '[]'::jsonb AS sim_details,
          '[]'::jsonb AS types_of_drugs
        FROM
          old_interragation_report oir
      ) base
    GROUP BY
      base.crime_id
  ) ir_details_data ON (
    (
      (ir_details_data.crime_id)::text = (c.crime_id)::text
    )
  )
  LEFT JOIN (
    SELECT
      fcp.crime_id,
      jsonb_agg(
        jsonb_build_object(
          'casePropertyId',
          fcp.case_property_id,
          'caseType',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.case_type
            ),
            ''::text
          ),
          'moId',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.mo_id
            ),
            ''::text
          ),
          'status',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.status
            ),
            ''::text
          ),
          'sendDate',
          fcp.send_date,
          'fslDate',
          fcp.fsl_date,
          'dateDisposal',
          fcp.date_disposal,
          'releaseDate',
          fcp.release_date,
          'returnDate',
          fcp.return_date,
          'dateCustody',
          fcp.date_custody,
          'dateSentToExpert',
          fcp.date_sent_to_expert,
          'courtOrderDate',
          fcp.court_order_date,
          'forwardingThrough',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.forwarding_through
            ),
            ''::text
          ),
          'courtName',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.court_name
            ),
            ''::text
          ),
          'fslCourtName',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.fsl_court_name
            ),
            ''::text
          ),
          'cprCourtName',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.cpr_court_name
            ),
            ''::text
          ),
          'courtOrderNumber',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.court_order_number
            ),
            ''::text
          ),
          'fslNo',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.fsl_no
            ),
            ''::text
          ),
          'fslRequestId',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.fsl_request_id
            ),
            ''::text
          ),
          'reportReceived',
          fcp.report_received,
          'opinion',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.opinion
            ),
            ''::text
          ),
          'opinionFurnished',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.opinion_furnished
            ),
            ''::text
          ),
          'strengthOfEvidence',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.strength_of_evidence
            ),
            ''::text
          ),
          'expertType',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.expert_type
            ),
            ''::text
          ),
          'otherExpertType',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.other_expert_type
            ),
            ''::text
          ),
          'cprNo',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.cpr_no
            ),
            ''::text
          ),
          'directionByCourt',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.direction_by_court
            ),
            ''::text
          ),
          'detailsDisposal',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.details_disposal
            ),
            ''::text
          ),
          'placeDisposal',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.place_disposal
            ),
            ''::text
          ),
          'releaseOrderNo',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.release_order_no
            ),
            ''::text
          ),
          'placeCustody',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.place_custody
            ),
            ''::text
          ),
          'assignCustody',
          NULLIF(
            TRIM(
              BOTH
              FROM
                fcp.assign_custody
            ),
            ''::text
          ),
          'propertyReceivedBack',
          fcp.property_received_back,
          'dateCreated',
          fcp.date_created,
          'dateModified',
          fcp.date_modified
        )
      ) AS details
    FROM
      fsl_case_property fcp
    GROUP BY
      fcp.crime_id
  ) fsl_case_property_details ON (
    (
      (fsl_case_property_details.crime_id)::text = (c.crime_id)::text
    )
  )
  LEFT JOIN (
    SELECT
      csu.crime_id,
      jsonb_agg(
        jsonb_build_object(
          'id',
          csu.id,
          'updateChargeSheetId',
          NULLIF(
            TRIM(
              BOTH
              FROM
                csu.update_charge_sheet_id
            ),
            ''::text
          ),
          'chargeSheetNo',
          NULLIF(
            TRIM(
              BOTH
              FROM
                csu.charge_sheet_no
            ),
            ''::text
          ),
          'chargeSheetDate',
          csu.charge_sheet_date,
          'chargeSheetStatus',
          NULLIF(
            TRIM(
              BOTH
              FROM
                csu.charge_sheet_status
            ),
            ''::text
          ),
          'takenOnFileDate',
          csu.taken_on_file_date,
          'takenOnFileCaseType',
          NULLIF(
            TRIM(
              BOTH
              FROM
                csu.taken_on_file_case_type
            ),
            ''::text
          ),
          'takenOnFileCourtCaseNo',
          NULLIF(
            TRIM(
              BOTH
              FROM
                csu.taken_on_file_court_case_no
            ),
            ''::text
          ),
          'dateCreated',
          csu.date_created
        )
      ) AS chargesheet_updates
    FROM
      charge_sheet_updates csu
    GROUP BY
      csu.crime_id
  ) chargesheet_updates_data ON (
    (
      (chargesheet_updates_data.crime_id)::text = (c.crime_id)::text
    )
  );