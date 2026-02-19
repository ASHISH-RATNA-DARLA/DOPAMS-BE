-- id: canonical_person_id UNIQUE NOT NULL
-- alias: alias, NULL if alias is NULL or empty
-- name: name, NULL if name is NULL or empty
-- surname: surname, NULL if surname is NULL or empty
-- fullName: full_name, NULL if full_name is NULL or empty
-- relationType: relation_type, NULL if relation_type is NULL or empty
-- relativeName: relative_name, NULL if relative_name is NULL or empty
-- gender: gender, UNKNOWN if gender is NULL or empty
-- isDied: is_died NOT NULL
-- dateOfBirth: date_of_birth NOT NULL
-- age: age
-- domicile: domicile_classification, UNKNOWN if domicile_classification is NULL or empty
-- occupation: occupation, NULL if occupation is NULL or empty
-- educationQualification: education_qualification, NULL if education_qualification is NULL or empty
-- caste: caste, NULL if caste is NULL or empty
-- subCaste: sub_caste, NULL if sub_caste is NULL or empty
-- religion: religion, NULL if religion is NULL or empty
-- nationality: nationality, UNKNOWN if nationality is NULL or empty
-- designation: designation, NULL if designation is NULL or empty
-- placeOfWork: place_of_work, NULL if place_of_work is NULL or empty
-- presentHouseNo: present_house_no, NULL if present_house_no is NULL or empty
-- presentStreetRoadNo: present_street_road_no, NULL if present_street_road_no is NULL or empty
-- presentWardColony: present_ward_colony, NULL if present_ward_colony is NULL or empty
-- presentLandmarkMilestone: present_landmark_milestone, NULL if present_landmark_milestone is NULL or empty
-- presentLocalityVillage: present_locality_village, NULL if present_locality_village is NULL or empty
-- presentAreaMandal: present_area_mandal, NULL if present_area_mandal is NULL or empty
-- presentDistrict: present_district, NULL if present_district is NULL or empty
-- presentStateUt: present_state_ut, NULL if present_state_ut is NULL or empty
-- presentCountry: present_country, NULL if present_country is NULL or empty
-- presentResidencyType: present_residency_type, NULL if present_residency_type is NULL or empty
-- presentPinCode: present_pin_code, NULL if present_pin_code is NULL or empty
-- presentJurisdictionPs: present_jurisdiction_ps, NULL if present_jurisdiction_ps is NULL or empty
-- permanentHouseNo: permanent_house_no, NULL if permanent_house_no is NULL or empty
-- permanentStreetRoadNo: permanent_street_road_no, NULL if permanent_street_road_no is NULL or empty
-- permanentWardColony: permanent_ward_colony, NULL if permanent_ward_colony is NULL or empty
-- permanentLandmarkMilestone: permanent_landmark_milestone, NULL if permanent_landmark_milestone is NULL or empty
-- permanentLocalityVillage: permanent_locality_village, NULL if permanent_locality_village is NULL or empty
-- permanentAreaMandal: permanent_area_mandal, NULL if permanent_area_mandal is NULL or empty
-- permanentDistrict: permanent_district, NULL if permanent_district is NULL or empty
-- permanentStateUt: permanent_state_ut, UNKNOWN if permanent_state_ut is NULL or empty
-- permanentCountry: permanent_country, NULL if permanent_country is NULL or empty
-- permanentResidencyType: permanent_residency_type, NULL if permanent_residency_type is NULL or empty
-- permanentPinCode: permanent_pin_code, NULL if permanent_pin_code is NULL or empty
-- permanentJurisdictionPs: permanent_jurisdiction_ps, NULL if permanent_jurisdiction_ps is NULL or empty
-- phoneNumber: phone_number, NULL if phone_number is NULL or empty
-- countryCode: country_code, NULL if country_code is NULL or empty
-- emailId: email_id, NULL if email_id is NULL or empty
SELECT
  adt.canonical_person_id AS id,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.alias
    ),
    ''::text
  ) AS alias,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.name
    ),
    ''::text
  ) AS name,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.surname
    ),
    ''::text
  ) AS surname,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.full_name
    ),
    ''::text
  ) AS "fullName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.relative_name
    ),
    ''::text
  ) AS "relativeName",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.relation_type
    ),
    ''::text
  ) AS "relationType",
  CASE
    WHEN (
      (p.gender IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            p.gender
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        p.gender
    )
  END AS gender,
  p.is_died AS "isDied",
  p.date_of_birth AS "dateOfBirth",
  p.age,
  CASE
    WHEN (
      (p.domicile_classification IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            p.domicile_classification
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    WHEN (
      upper(
        TRIM(
          BOTH
          FROM
            p.domicile_classification
        )
      ) = 'NATIVE STATE'::text
    ) THEN 'Telangana'::text
    WHEN (
      upper(
        TRIM(
          BOTH
          FROM
            p.domicile_classification
        )
      ) = 'INTER STATE'::text
    ) THEN 'Other State'::text
    WHEN (
      upper(
        TRIM(
          BOTH
          FROM
            p.domicile_classification
        )
      ) = 'INTERNATIONAL'::text
    ) THEN 'Foreign Nationals'::text
    ELSE TRIM(
      BOTH
      FROM
        p.domicile_classification
    )
  END AS domicile,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.occupation
    ),
    ''::text
  ) AS occupation,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.education_qualification
    ),
    ''::text
  ) AS "educationQualification",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.caste
    ),
    ''::text
  ) AS caste,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.sub_caste
    ),
    ''::text
  ) AS "subCaste",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.religion
    ),
    ''::text
  ) AS religion,
  CASE
    WHEN (
      (p.nationality IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            p.nationality
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        p.nationality
    )
  END AS nationality,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.designation
    ),
    ''::text
  ) AS designation,
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.place_of_work
    ),
    ''::text
  ) AS "placeOfWork",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_house_no
    ),
    ''::text
  ) AS "presentHouseNo",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_street_road_no
    ),
    ''::text
  ) AS "presentStreetRoadNo",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_ward_colony
    ),
    ''::text
  ) AS "presentWardColony",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_landmark_milestone
    ),
    ''::text
  ) AS "presentLandmarkMilestone",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_locality_village
    ),
    ''::text
  ) AS "presentLocalityVillage",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_area_mandal
    ),
    ''::text
  ) AS "presentAreaMandal",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_district
    ),
    ''::text
  ) AS "presentDistrict",
  CASE
    WHEN (
      (p.present_state_ut IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            p.present_state_ut
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        p.present_state_ut
    )
  END AS "presentStateUt",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_country
    ),
    ''::text
  ) AS "presentCountry",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_residency_type
    ),
    ''::text
  ) AS "presentResidencyType",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_pin_code
    ),
    ''::text
  ) AS "presentPinCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_jurisdiction_ps
    ),
    ''::text
  ) AS "presentJurisdictionPs",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_house_no
    ),
    ''::text
  ) AS "permanentHouseNo",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_street_road_no
    ),
    ''::text
  ) AS "permanentStreetRoadNo",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_ward_colony
    ),
    ''::text
  ) AS "permanentWardColony",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_landmark_milestone
    ),
    ''::text
  ) AS "permanentLandmarkMilestone",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_locality_village
    ),
    ''::text
  ) AS "permanentLocalityVillage",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_area_mandal
    ),
    ''::text
  ) AS "permanentAreaMandal",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_district
    ),
    ''::text
  ) AS "permanentDistrict",
  CASE
    WHEN (
      (p.permanent_state_ut IS NULL)
      OR (
        TRIM(
          BOTH
          FROM
            p.permanent_state_ut
        ) = ''::text
      )
    ) THEN 'Unknown'::text
    ELSE TRIM(
      BOTH
      FROM
        p.permanent_state_ut
    )
  END AS "permanentStateUt",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_country
    ),
    ''::text
  ) AS "permanentCountry",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_residency_type
    ),
    ''::text
  ) AS "permanentResidencyType",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_pin_code
    ),
    ''::text
  ) AS "permanentPinCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_jurisdiction_ps
    ),
    ''::text
  ) AS "permanentJurisdictionPs",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.phone_number
    ),
    ''::text
  ) AS "phoneNumber",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.country_code
    ),
    ''::text
  ) AS "countryCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.email_id
    ),
    ''::text
  ) AS "emailId",
  COALESCE(identity_documents.docs, '[]'::jsonb) AS "identityDocuments",
  COALESCE(person_documents.docs, '[]'::jsonb) AS documents,
  COALESCE(crimes_details.details, '[]'::jsonb) AS crimes,
  crimes_details.latest_crime_id AS "latestCrimeId",
  crimes_details.latest_crime_no AS "latestCrimeNo",
  COALESCE(crimes_details.no_of_crimes, (0)::bigint) AS "noOfCrimes",
  COALESCE(arrest_stats.arrest_count, (0)::bigint) AS "arrestCount",
  COALESCE(
    crimes_details.previously_involved_cases,
    '[]'::jsonb
  ) AS "previouslyInvolvedCases",
  COALESCE(drug_summary.associated_drugs, ARRAY[]::text[]) AS "associatedDrugs",
  ARRAY[]::text[] AS "DOPAMSLinks",
  NULL::text AS counselled,
  ARRAY[]::text[] AS "socialMedia",
  NULL::text AS "RTAData",
  NULL::text AS "bankAcountDetails",
  NULL::text AS "passportDetails_Foreigners",
  NULL::text AS "purposeOfVISA_Foreigners",
  NULL::text AS "validityOfVISA_Foreigners",
  NULL::text AS "localaddress_Foreigners",
  NULL::text AS "nativeAddress_Foreigners",
  NULL::text AS "statusOfTheAccused",
  NULL::text AS "historySheet",
  NULL::text AS "propertyForfeited",
  NULL::text AS "PITNDPSInitiated",
  NULL::text AS photo
FROM
  (
    (
      (
        (
          (
            (
              agent_deduplication_tracker adt
              JOIN persons p ON (
                (
                  (p.person_id)::text = (adt.canonical_person_id)::text
                )
              )
            )
            LEFT JOIN LATERAL (
              SELECT
                jsonb_agg(
                  ordered_crimes.crime_data
                  ORDER BY
                    ordered_crimes.fir_date DESC NULLS LAST
                ) AS details,
                (
                  array_agg(
                    ordered_crimes.crime_id
                    ORDER BY
                      ordered_crimes.fir_date DESC NULLS LAST
                  )
                ) [1] AS latest_crime_id,
                (
                  array_agg(
                    ordered_crimes.fir_num
                    ORDER BY
                      ordered_crimes.fir_date DESC NULLS LAST
                  )
                ) [1] AS latest_crime_no,
                count(DISTINCT ordered_crimes.crime_id) AS no_of_crimes,
                jsonb_agg(
                  jsonb_build_object(
                    'id',
                    ordered_crimes.crime_id,
                    'value',
                    ordered_crimes.prev_case_string
                  )
                ) AS previously_involved_cases
              FROM
                (
                  SELECT
                    c.crime_id,
                    c.fir_num,
                    c.fir_date,
                    jsonb_build_object(
                      'unit',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            h.dist_name
                        ),
                        ''::text
                      ),
                      'ps',
                      COALESCE(
                        NULLIF(
                          TRIM(
                            BOTH
                            FROM
                              h.ps_name
                          ),
                          ''::text
                        ),
                        NULLIF(
                          TRIM(
                            BOTH
                            FROM
                              c.ps_code
                          ),
                          ''::text
                        )
                      ),
                      'year',
                      CASE
                        WHEN (c.fir_date IS NOT NULL) THEN (
                          EXTRACT(
                            year
                            FROM
                              c.fir_date
                          )
                        )::integer
                        ELSE NULL::integer
                      END,
                      'id',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.crime_id
                        ),
                        ''::text
                      ),
                      'firNumber',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.fir_num
                        ),
                        ''::text
                      ),
                      'firRegNum',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.fir_reg_num
                        ),
                        ''::text
                      ),
                      'firType',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.fir_type
                        ),
                        ''::text
                      ),
                      'section',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.acts_sections
                        ),
                        ''::text
                      ),
                      'crimeRegDate',
                      CASE
                        WHEN (c.fir_date IS NOT NULL) THEN ((c.fir_date)::date)::text
                        ELSE NULL::text
                      END,
                      'majorHead',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.major_head
                        ),
                        ''::text
                      ),
                      'minorHead',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.minor_head
                        ),
                        ''::text
                      ),
                      'crimeType',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.crime_type
                        ),
                        ''::text
                      ),
                      'ioName',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.io_name
                        ),
                        ''::text
                      ),
                      'ioRank',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.io_rank
                        ),
                        ''::text
                      ),
                      'briefFacts',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.brief_facts
                        ),
                        ''::text
                      ),
                      'accusedCode',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            a.accused_code
                        ),
                        ''::text
                      ),
                      'accusedType',
                      CASE
                        WHEN (
                          (bfa.accused_type IS NULL)
                          OR (
                            TRIM(
                              BOTH
                              FROM
                                bfa.accused_type
                            ) = ''::text
                          )
                        ) THEN 'Unknown'::text
                        ELSE initcap(
                          TRIM(
                            BOTH
                            FROM
                              bfa.accused_type
                          )
                        )
                      END,
                      'accusedStatus',
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
                      'caseStatus',
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.case_status
                        ),
                        ''::text
                      ),
                      'chargesheets',
                      COALESCE(cs_data.chargesheets, '[]'::jsonb),
                      'interrogationReports',
                      COALESCE(ir_data.interrogation_reports, '[]'::jsonb)
                    ) AS crime_data,
                    concat_ws(
                      ' '::text,
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            c.fir_num
                        ),
                        ''::text
                      ),
                      CASE
                        WHEN (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                h.ps_name
                            ),
                            ''::text
                          ) IS NOT NULL
                        ) THEN concat(
                          'of ',
                          TRIM(
                            BOTH
                            FROM
                              h.ps_name
                          )
                        )
                        ELSE NULL::text
                      END,
                      CASE
                        WHEN (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                h.dist_name
                            ),
                            ''::text
                          ) IS NOT NULL
                        ) THEN concat(
                          'of ',
                          TRIM(
                            BOTH
                            FROM
                              h.dist_name
                          )
                        )
                        ELSE NULL::text
                      END,
                      CASE
                        WHEN (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                c.case_status
                            ),
                            ''::text
                          ) IS NOT NULL
                        ) THEN concat(
                          '(',
                          TRIM(
                            BOTH
                            FROM
                              c.case_status
                          ),
                          ')'
                        )
                        ELSE NULL::text
                      END
                    ) AS prev_case_string
                  FROM
                    (
                      (
                        (
                          (
                            (
                              (
                                unnest(adt.all_crime_ids) ac (crime_id)
                                LEFT JOIN crimes c ON (((c.crime_id)::text = ac.crime_id))
                              )
                              LEFT JOIN hierarchy h ON (((h.ps_code)::text = (c.ps_code)::text))
                            )
                            LEFT JOIN accused a ON (
                              (
                                ((a.crime_id)::text = (c.crime_id)::text)
                                AND (
                                  (a.person_id)::text = (adt.canonical_person_id)::text
                                )
                              )
                            )
                          )
                          LEFT JOIN arrests ar ON (
                            (
                              ((ar.crime_id)::text = (c.crime_id)::text)
                              AND (ar.accused_seq_no = (a.seq_num)::text)
                            )
                          )
                        )
                        LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
                      )
                      LEFT JOIN LATERAL (
                        SELECT
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
                              cs_accuseds.accused
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
                            LEFT JOIN LATERAL (
                              SELECT
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
                                        (a_cs.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                a_cs.accused_code
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        TRIM(
                                          BOTH
                                          FROM
                                            a_cs.accused_code
                                        ) || ':'::text
                                      )
                                      ELSE NULL::text
                                    END,
                                    NULLIF(
                                      TRIM(
                                        BOTH
                                        FROM
                                          COALESCE(p_cs.full_name, p_cs.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_cs.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_cs.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_cs.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_cs.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_cs.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_cs.status
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
                                                bfa_cs.status
                                            )
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                ) AS accused
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
                                        LEFT JOIN persons p_cs ON (
                                          (
                                            (p_cs.person_id)::text = (adt_cs.canonical_person_id)::text
                                          )
                                        )
                                      )
                                      LEFT JOIN accused a_cs ON (
                                        (
                                          (
                                            (a_cs.person_id)::text = (csa.accused_person_id)::text
                                          )
                                          AND ((a_cs.crime_id)::text = (cs_acc.crime_id)::text)
                                        )
                                      )
                                    )
                                    LEFT JOIN arrests ar_cs ON (
                                      (
                                        ((ar_cs.crime_id)::text = (a_cs.crime_id)::text)
                                        AND (ar_cs.accused_seq_no = (a_cs.seq_num)::text)
                                      )
                                    )
                                  )
                                  LEFT JOIN brief_facts_accused bfa_cs ON (
                                    (
                                      (bfa_cs.accused_id)::text = (a_cs.accused_id)::text
                                    )
                                  )
                                )
                              WHERE
                                (
                                  ((csa.chargesheet_id)::text = (cs.id)::text)
                                  AND (
                                    (csa.accused_person_id)::text = ANY (adt.all_person_ids)
                                  )
                                )
                              LIMIT
                                1
                            ) cs_accuseds ON (TRUE)
                          )
                        WHERE
                          (
                            ((cs.crime_id)::text = (c.crime_id)::text)
                            AND (
                              EXISTS (
                                SELECT
                                  1
                                FROM
                                  chargesheet_accused csa_filter
                                WHERE
                                  (
                                    ((csa_filter.chargesheet_id)::text = (cs.id)::text)
                                    AND (
                                      (csa_filter.accused_person_id)::text = ANY (adt.all_person_ids)
                                    )
                                  )
                              )
                              OR EXISTS (
                                SELECT
                                  1
                                FROM
                                  agent_deduplication_tracker adt_filter
                                WHERE
                                  (
                                    (adt_filter.canonical_person_id)::text = (adt.canonical_person_id)::text
                                    AND EXISTS (
                                      SELECT
                                        1
                                      FROM
                                        chargesheet_accused csa_filter2
                                      WHERE
                                        (
                                          (
                                            (csa_filter2.chargesheet_id)::text = (cs.id)::text
                                          )
                                          AND (
                                            (csa_filter2.accused_person_id)::text = ANY (adt_filter.all_person_ids)
                                          )
                                        )
                                    )
                                  )
                              )
                            )
                          )
                        GROUP BY
                          cs.crime_id
                      ) cs_data ON (TRUE)
                      LEFT JOIN LATERAL (
                        SELECT
                          jsonb_agg(
                            (
                              jsonb_build_object(
                                'interrogationReportId',
                                ir.interrogation_report_id,
                                'crimeId',
                                ir.crime_id,
                                'personId',
                                ir.person_id
                              ) || jsonb_build_object(
                                'physicalBeard',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_beard
                                  ),
                                  ''::text
                                ),
                                'physicalBuild',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_build
                                  ),
                                  ''::text
                                ),
                                'physicalBurnMarks',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_burn_marks
                                  ),
                                  ''::text
                                ),
                                'physicalColor',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_color
                                  ),
                                  ''::text
                                ),
                                'physicalDeformitiesOrPeculiarities',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_deformities_or_peculiarities
                                  ),
                                  ''::text
                                ),
                                'physicalDeformities',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_deformities
                                  ),
                                  ''::text
                                ),
                                'physicalEar',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_ear
                                  ),
                                  ''::text
                                ),
                                'physicalEyes',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_eyes
                                  ),
                                  ''::text
                                ),
                                'physicalFace',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_face
                                  ),
                                  ''::text
                                ),
                                'physicalHair',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_hair
                                  ),
                                  ''::text
                                ),
                                'physicalHeight',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_height
                                  ),
                                  ''::text
                                ),
                                'physicalIdentificationMarks',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_identification_marks
                                  ),
                                  ''::text
                                ),
                                'physicalLanguageOrDialect',
                                ir.physical_language_or_dialect,
                                'physicalLeucoderma',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_leucoderma
                                  ),
                                  ''::text
                                ),
                                'physicalMole',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_mole
                                  ),
                                  ''::text
                                ),
                                'physicalMustache',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_mustache
                                  ),
                                  ''::text
                                ),
                                'physicalNose',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_nose
                                  ),
                                  ''::text
                                ),
                                'physicalScar',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_scar
                                  ),
                                  ''::text
                                ),
                                'physicalTattoo',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_tattoo
                                  ),
                                  ''::text
                                ),
                                'physicalTeeth',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.physical_teeth
                                  ),
                                  ''::text
                                )
                              ) || jsonb_build_object(
                                'socioLivingStatus',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.socio_living_status
                                  ),
                                  ''::text
                                ),
                                'socioMaritalStatus',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.socio_marital_status
                                  ),
                                  ''::text
                                ),
                                'socioEducation',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.socio_education
                                  ),
                                  ''::text
                                ),
                                'socioOccupation',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.socio_occupation
                                  ),
                                  ''::text
                                ),
                                'socioIncomeGroup',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.socio_income_group
                                  ),
                                  ''::text
                                )
                              ) || jsonb_build_object(
                                'offenceTime',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.offence_time
                                  ),
                                  ''::text
                                ),
                                'otherOffenceTime',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.other_offence_time
                                  ),
                                  ''::text
                                ),
                                'shareOfAmountSpent',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.share_of_amount_spent
                                  ),
                                  ''::text
                                ),
                                'otherShareOfAmountSpent',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.other_share_of_amount_spent
                                  ),
                                  ''::text
                                ),
                                'shareRemarks',
                                ir.share_remarks
                              ) || jsonb_build_object(
                                'isInJail',
                                ir.is_in_jail,
                                'fromWhereSentInJail',
                                ir.from_where_sent_in_jail,
                                'inJailCrimeNum',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.in_jail_crime_num
                                  ),
                                  ''::text
                                ),
                                'inJailDistUnit',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.in_jail_dist_unit
                                  ),
                                  ''::text
                                ),
                                'isOnBail',
                                ir.is_on_bail,
                                'fromWhereSentOnBail',
                                ir.from_where_sent_on_bail,
                                'onBailCrimeNum',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.on_bail_crime_num
                                  ),
                                  ''::text
                                ),
                                'dateOfBail',
                                ir.date_of_bail
                              ) || jsonb_build_object(
                                'isAbsconding',
                                ir.is_absconding,
                                'wantedInPoliceStation',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.wanted_in_police_station
                                  ),
                                  ''::text
                                ),
                                'abscondingCrimeNum',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.absconding_crime_num
                                  ),
                                  ''::text
                                ),
                                'isNormalLife',
                                ir.is_normal_life,
                                'ekingLivelihoodByLaborWork',
                                ir.eking_livelihood_by_labor_work,
                                'isRehabilitated',
                                ir.is_rehabilitated,
                                'rehabilitationDetails',
                                ir.rehabilitation_details,
                                'isDead',
                                ir.is_dead,
                                'deathDetails',
                                ir.death_details
                              ) || jsonb_build_object(
                                'isFacingTrial',
                                ir.is_facing_trial,
                                'facingTrialPsName',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.facing_trial_ps_name
                                  ),
                                  ''::text
                                ),
                                'facingTrialCrimeNum',
                                NULLIF(
                                  TRIM(
                                    BOTH
                                    FROM
                                      ir.facing_trial_crime_num
                                  ),
                                  ''::text
                                ),
                                'otherRegularHabits',
                                ir.other_regular_habits,
                                'otherIndulgenceBeforeOffence',
                                ir.other_indulgence_before_offence,
                                'timeSinceModusOperandi',
                                ir.time_since_modus_operandi,
                                'dateCreated',
                                ir.date_created,
                                'dateModified',
                                ir.date_modified,
                                'associateDetails',
                                COALESCE(
                                  ir_associate_details_data.associate_details,
                                  '[]'::jsonb
                                ),
                                'consumerDetails',
                                COALESCE(
                                  ir_consumer_details_data.consumer_details,
                                  '[]'::jsonb
                                ),
                                'defenceCounsel',
                                COALESCE(
                                  ir_defence_counsel_data.defence_counsel,
                                  '[]'::jsonb
                                ),
                                'dopamsLinks',
                                COALESCE(ir_dopams_links_data.dopams_links, '[]'::jsonb),
                                'familyHistory',
                                COALESCE(
                                  ir_family_history_data.family_history,
                                  '[]'::jsonb
                                ),
                                'financialHistory',
                                COALESCE(
                                  ir_financial_history_data.financial_history,
                                  '[]'::jsonb
                                ),
                                'localContacts',
                                COALESCE(
                                  ir_local_contacts_data.local_contacts,
                                  '[]'::jsonb
                                ),
                                'modusOperandi',
                                COALESCE(
                                  ir_modus_operandi_data.modus_operandi,
                                  '[]'::jsonb
                                ),
                                'previousOffencesConfessed',
                                COALESCE(
                                  ir_previous_offences_data.previous_offences,
                                  '[]'::jsonb
                                ),
                                'regularHabits',
                                COALESCE(
                                  ir_regular_habits_data.regular_habits,
                                  '[]'::jsonb
                                ),
                                'shelter',
                                COALESCE(ir_shelter_data.shelter, '[]'::jsonb),
                                'simDetails',
                                COALESCE(ir_sim_details_data.sim_details, '[]'::jsonb),
                                'typesOfDrugs',
                                COALESCE(
                                  ir_types_of_drugs_data.types_of_drugs,
                                  '[]'::jsonb
                                )
                              )
                            )
                          ) AS interrogation_reports
                        FROM
                          interrogation_reports ir
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_ad.full_name, p_ad.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_ad.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_ad.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_ad.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_ad.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_ad.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_ad.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_ad.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS associate_details
                            FROM
                              ir_associate_details iad
                              LEFT JOIN agent_deduplication_tracker adt_ad ON (
                                (iad.person_id)::text = ANY (adt_ad.all_person_ids)
                              )
                              LEFT JOIN persons p_ad ON (
                                (p_ad.person_id)::text = (adt_ad.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_ad ON (
                                ((a_ad.person_id)::text = (iad.person_id)::text)
                                AND ((a_ad.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_ad ON (
                                ((ar_ad.crime_id)::text = (a_ad.crime_id)::text)
                                AND (ar_ad.accused_seq_no = (a_ad.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_ad ON (
                                (
                                  (bfa_ad.accused_id)::text = (a_ad.accused_id)::text
                                )
                              )
                            WHERE
                              (iad.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_associate_details_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_cd.full_name, p_cd.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_cd.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_cd.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_cd.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_cd.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_cd.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_cd.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_cd.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS consumer_details
                            FROM
                              ir_consumer_details icd
                              LEFT JOIN agent_deduplication_tracker adt_cd ON (
                                (icd.consumer_person_id)::text = ANY (adt_cd.all_person_ids)
                              )
                              LEFT JOIN persons p_cd ON (
                                (p_cd.person_id)::text = (adt_cd.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_cd ON (
                                (
                                  (a_cd.person_id)::text = (icd.consumer_person_id)::text
                                )
                                AND ((a_cd.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_cd ON (
                                ((ar_cd.crime_id)::text = (a_cd.crime_id)::text)
                                AND (ar_cd.accused_seq_no = (a_cd.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_cd ON (
                                (
                                  (bfa_cd.accused_id)::text = (a_cd.accused_id)::text
                                )
                              )
                            WHERE
                              (icd.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_consumer_details_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_dc.full_name, p_dc.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_dc.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_dc.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_dc.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_dc.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_dc.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_dc.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_dc.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS defence_counsel
                            FROM
                              ir_defence_counsel idc
                              LEFT JOIN agent_deduplication_tracker adt_dc ON (
                                (idc.defence_counsel_person_id)::text = ANY (adt_dc.all_person_ids)
                              )
                              LEFT JOIN persons p_dc ON (
                                (p_dc.person_id)::text = (adt_dc.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_dc ON (
                                (
                                  (a_dc.person_id)::text = (idc.defence_counsel_person_id)::text
                                )
                                AND ((a_dc.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_dc ON (
                                ((ar_dc.crime_id)::text = (a_dc.crime_id)::text)
                                AND (ar_dc.accused_seq_no = (a_dc.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_dc ON (
                                (
                                  (bfa_dc.accused_id)::text = (a_dc.accused_id)::text
                                )
                              )
                            WHERE
                              (idc.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_defence_counsel_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                  idl.dopams_data
                                )
                              ) AS dopams_links
                            FROM
                              ir_dopams_links idl
                            WHERE
                              (idl.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_dopams_links_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_fh.full_name, p_fh.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_fh.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_fh.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_fh.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_fh.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_fh.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_fh.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_fh.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS family_history
                            FROM
                              ir_family_history ifh
                              LEFT JOIN agent_deduplication_tracker adt_fh ON (
                                (ifh.person_id)::text = ANY (adt_fh.all_person_ids)
                              )
                              LEFT JOIN persons p_fh ON (
                                (p_fh.person_id)::text = (adt_fh.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_fh ON (
                                ((a_fh.person_id)::text = (ifh.person_id)::text)
                                AND ((a_fh.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_fh ON (
                                ((ar_fh.crime_id)::text = (a_fh.crime_id)::text)
                                AND (ar_fh.accused_seq_no = (a_fh.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_fh ON (
                                (
                                  (bfa_fh.accused_id)::text = (a_fh.accused_id)::text
                                )
                              )
                            WHERE
                              (ifh.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_family_history_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_fin.full_name, p_fin.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_fin.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_fin.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_fin.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_fin.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_fin.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_fin.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_fin.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS financial_history
                            FROM
                              ir_financial_history ifin
                              LEFT JOIN agent_deduplication_tracker adt_fin ON (
                                (ifin.account_holder_person_id)::text = ANY (adt_fin.all_person_ids)
                              )
                              LEFT JOIN persons p_fin ON (
                                (p_fin.person_id)::text = (adt_fin.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_fin ON (
                                (
                                  (a_fin.person_id)::text = (ifin.account_holder_person_id)::text
                                )
                                AND ((a_fin.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_fin ON (
                                ((ar_fin.crime_id)::text = (a_fin.crime_id)::text)
                                AND (ar_fin.accused_seq_no = (a_fin.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_fin ON (
                                (
                                  (bfa_fin.accused_id)::text = (a_fin.accused_id)::text
                                )
                              )
                            WHERE
                              (ifin.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_financial_history_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_lc.full_name, p_lc.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_lc.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_lc.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_lc.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_lc.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_lc.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_lc.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_lc.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS local_contacts
                            FROM
                              ir_local_contacts ilc
                              LEFT JOIN agent_deduplication_tracker adt_lc ON (
                                (ilc.person_id)::text = ANY (adt_lc.all_person_ids)
                              )
                              LEFT JOIN persons p_lc ON (
                                (p_lc.person_id)::text = (adt_lc.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_lc ON (
                                ((a_lc.person_id)::text = (ilc.person_id)::text)
                                AND ((a_lc.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_lc ON (
                                ((ar_lc.crime_id)::text = (a_lc.crime_id)::text)
                                AND (ar_lc.accused_seq_no = (a_lc.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_lc ON (
                                (
                                  (bfa_lc.accused_id)::text = (a_lc.accused_id)::text
                                )
                              )
                            WHERE
                              (ilc.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_local_contacts_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                              ) AS modus_operandi
                            FROM
                              ir_modus_operandi imo
                            WHERE
                              (imo.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_modus_operandi_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                              ) AS previous_offences
                            FROM
                              ir_previous_offences_confessed ipoc
                            WHERE
                              (ipoc.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_previous_offences_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                              ) AS regular_habits
                            FROM
                              ir_regular_habits irh
                            WHERE
                              (irh.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_regular_habits_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                              ) AS shelter
                            FROM
                              ir_shelter ish
                            WHERE
                              (ish.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_shelter_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_sd.full_name, p_sd.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_sd.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_sd.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_sd.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_sd.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_sd.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_sd.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_sd.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS sim_details
                            FROM
                              ir_sim_details isd
                              LEFT JOIN agent_deduplication_tracker adt_sd ON (
                                (isd.person_id)::text = ANY (adt_sd.all_person_ids)
                              )
                              LEFT JOIN persons p_sd ON (
                                (p_sd.person_id)::text = (adt_sd.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_sd ON (
                                ((a_sd.person_id)::text = (isd.person_id)::text)
                                AND ((a_sd.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_sd ON (
                                ((ar_sd.crime_id)::text = (a_sd.crime_id)::text)
                                AND (ar_sd.accused_seq_no = (a_sd.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_sd ON (
                                (
                                  (bfa_sd.accused_id)::text = (a_sd.accused_id)::text
                                )
                              )
                            WHERE
                              (isd.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_sim_details_data ON (TRUE)
                          LEFT JOIN LATERAL (
                            SELECT
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
                                          COALESCE(p_supp.full_name, p_supp.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_supp.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_supp.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_supp.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_supp.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_supp.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_supp.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_supp.status
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
                                          COALESCE(p_rec.full_name, p_rec.name)
                                      ),
                                      ''::text
                                    ),
                                    CASE
                                      WHEN (ar_rec.is_arrested IS TRUE) THEN '(Arrested)'::text
                                      WHEN (ar_rec.is_apprehended IS TRUE) THEN '(Apprehended)'::text
                                      WHEN (ar_rec.is_absconding IS TRUE) THEN '(Absconding)'::text
                                      WHEN (ar_rec.is_died IS TRUE) THEN '(Died)'::text
                                      WHEN (
                                        (bfa_rec.accused_id IS NOT NULL)
                                        AND (
                                          NULLIF(
                                            TRIM(
                                              BOTH
                                              FROM
                                                bfa_rec.status
                                            ),
                                            ''::text
                                          ) IS NOT NULL
                                        )
                                      ) THEN (
                                        '(' || initcap(
                                          TRIM(
                                            BOTH
                                            FROM
                                              bfa_rec.status
                                          )
                                        ) || ')'::text
                                      )
                                      ELSE NULL::text
                                    END
                                  )
                                )
                              ) AS types_of_drugs
                            FROM
                              ir_types_of_drugs itod
                              LEFT JOIN agent_deduplication_tracker adt_supp ON (
                                (itod.supplier_person_id)::text = ANY (adt_supp.all_person_ids)
                              )
                              LEFT JOIN persons p_supp ON (
                                (p_supp.person_id)::text = (adt_supp.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_supp ON (
                                (
                                  (a_supp.person_id)::text = (itod.supplier_person_id)::text
                                )
                                AND ((a_supp.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_supp ON (
                                (
                                  (ar_supp.crime_id)::text = (a_supp.crime_id)::text
                                )
                                AND (ar_supp.accused_seq_no = (a_supp.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_supp ON (
                                (
                                  (bfa_supp.accused_id)::text = (a_supp.accused_id)::text
                                )
                              )
                              LEFT JOIN agent_deduplication_tracker adt_rec ON (
                                (itod.receivers_person_id)::text = ANY (adt_rec.all_person_ids)
                              )
                              LEFT JOIN persons p_rec ON (
                                (p_rec.person_id)::text = (adt_rec.canonical_person_id)::text
                              )
                              LEFT JOIN accused a_rec ON (
                                (
                                  (a_rec.person_id)::text = (itod.receivers_person_id)::text
                                )
                                AND ((a_rec.crime_id)::text = (ir.crime_id)::text)
                              )
                              LEFT JOIN arrests ar_rec ON (
                                ((ar_rec.crime_id)::text = (a_rec.crime_id)::text)
                                AND (ar_rec.accused_seq_no = (a_rec.seq_num)::text)
                              )
                              LEFT JOIN brief_facts_accused bfa_rec ON (
                                (
                                  (bfa_rec.accused_id)::text = (a_rec.accused_id)::text
                                )
                              )
                            WHERE
                              (itod.interrogation_report_id)::text = (ir.interrogation_report_id)::text
                          ) ir_types_of_drugs_data ON (TRUE)
                        WHERE
                          (
                            ((ir.crime_id)::text = (c.crime_id)::text)
                            AND (
                              (ir.person_id IS NOT NULL)
                              AND ((ir.person_id)::text = ANY (adt.all_person_ids))
                            )
                          )
                      ) ir_data ON (TRUE)
                    )
                ) ordered_crimes
            ) crimes_details ON (TRUE)
          )
          LEFT JOIN LATERAL (
            SELECT
              count(*) AS arrest_count
            FROM
              arrests a_ar
            WHERE
              (
                ((a_ar.person_id)::text = ANY (adt.all_person_ids))
                AND (a_ar.is_arrested IS TRUE)
              )
          ) arrest_stats ON (TRUE)
        )
        LEFT JOIN LATERAL (
          SELECT
            array_agg(drug_strings.drug_string) AS associated_drugs
          FROM
            (
              SELECT
                agg.primary_drug_name,
                CASE
                  WHEN (qty_parts.qty IS NULL) THEN (agg.primary_drug_name)::text
                  ELSE concat(agg.primary_drug_name, ' ( ', qty_parts.qty, ' )')
                END AS drug_string
              FROM
                (
                  (
                    SELECT
                      bfd.primary_drug_name,
                      sum(bfd.standardized_weight_kg) AS total_kg,
                      sum(bfd.standardized_volume_ml) AS total_ml,
                      sum(bfd.standardized_count) AS total_count
                    FROM
                      brief_facts_drug bfd
                    WHERE
                      (
                        ((bfd.crime_id)::text = ANY (adt.all_crime_ids))
                        AND (
                          NULLIF(
                            TRIM(
                              BOTH
                              FROM
                                bfd.primary_drug_name
                            ),
                            ''::text
                          ) IS NOT NULL
                        )
                        AND (
                          (bfd.primary_drug_name)::text <> 'NO_DRUGS_DETECTED'::text
                        )
                      )
                    GROUP BY
                      bfd.primary_drug_name
                  ) agg
                  CROSS JOIN LATERAL (
                    SELECT
                      NULLIF(
                        concat_ws(
                          ', '::text,
                          CASE
                            WHEN (
                              (agg.total_kg IS NOT NULL)
                              AND (agg.total_kg <> (0)::numeric)
                            ) THEN concat(
                              TRIM(
                                BOTH
                                FROM
                                  (agg.total_kg)::text
                              ),
                              ' Kgs'
                            )
                            ELSE NULL::text
                          END,
                          CASE
                            WHEN (
                              (agg.total_ml IS NOT NULL)
                              AND (agg.total_ml <> (0)::numeric)
                            ) THEN concat(
                              TRIM(
                                BOTH
                                FROM
                                  (agg.total_ml)::text
                              ),
                              ' Mls'
                            )
                            ELSE NULL::text
                          END,
                          CASE
                            WHEN (
                              (agg.total_count IS NOT NULL)
                              AND (agg.total_count <> (0)::numeric)
                            ) THEN concat(
                              TRIM(
                                BOTH
                                FROM
                                  (agg.total_count)::text
                              ),
                              ' Packets/Pills'
                            )
                            ELSE NULL::text
                          END
                        ),
                        ''::text
                      ) AS qty
                  ) qty_parts
                )
            ) drug_strings
        ) drug_summary ON (TRUE)
      )
      LEFT JOIN (
        SELECT
          f.parent_id AS person_id,
          jsonb_agg(
            jsonb_build_object(
              'type',
              f.source_field,
              'link',
              f.file_url,
              'identityType',
              f.identity_type,
              'identityNumber',
              f.identity_number
            )
          ) FILTER (
            WHERE
              (f.file_url IS NOT NULL)
          ) AS docs
        FROM
          files f
        WHERE
          ((f.source_type)::text = 'person'::text)
        GROUP BY
          f.parent_id
      ) identity_documents ON (
        (
          (identity_documents.person_id)::text = (p.person_id)::text
        )
      )
    )
    LEFT JOIN (
      SELECT
        f.parent_id AS person_id,
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
          ((f.source_type)::text = 'person'::text)
          AND ((f.source_field)::text = 'MEDIA'::text)
        )
      GROUP BY
        f.parent_id
    ) person_documents ON (
      (
        (person_documents.person_id)::text = (p.person_id)::text
      )
    )
  );