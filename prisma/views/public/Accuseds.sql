-- id: accused_id UNIQUE NOT NULL
-- crimeId: crime_id NOT NULL
-- personId: canonical_person_id or person_id NOT NULL
-- unit: dist_name, UNKNOWN if dist_name is NULL or empty
-- ps: ps_name, UNKNOWN if ps_name is NULL or empty
-- year: year of fir_date
-- firNumber: fir_num, NULL if fir_num is NULL or empty
-- firRegNum: fir_reg_num, NULL if fir_reg_num is NULL or empty
-- section: acts_sections, NULL if acts_sections is NULL or empty
-- crimeRegDate: fir_date
-- briefFacts: brief_facts, NULL if brief_facts is NULL or empty
-- caseClassification: class_classification, UNKNOWN if class_classification is NULL or empty
-- caseStatus: case_status, UNKNOWN if case_status is NULL or empty
-- accusedCode: accused_code, NULL if accused_code is NULL or empty
-- noOfAccusedInvolved: count of accused_id in accused table
-- seqNum: seq_num NOT NULL
-- isCCL: is_ccl NOT NULL
-- beard: beard, NULL if beard is NULL or empty
-- build: build, NULL if build is NULL or empty
-- color: color, NULL if color is NULL or empty
-- ear: ear, NULL if ear is NULL or empty
-- eyes: eyes, NULL if eyes is NULL or empty
-- face: face, NULL if face is NULL or empty
-- hair: hair, NULL if hair is NULL or empty
-- height: height, NULL if height is NULL or empty
-- leucoderma: leucoderma, NULL if leucoderma is NULL or empty
-- mole: mole, NULL if mole is NULL or empty
-- mustache: mustache, NULL if mustache is NULL or empty
-- nose: nose, NULL if nose is NULL or empty
-- teeth: teeth, NULL if teeth is NULL or empty
-- accusedStatus: status, UNKNOWN if status is NULL or empty
-- accusedType: accused_type, UNKNOWN if accused_type is NULL or empty
-- name: name, NULL if name is NULL or empty
-- surname: surname, NULL if surname is NULL or empty
-- alias: alias, NULL if alias is NULL or empty
-- fullName: full_name, NULL if full_name is NULL or empty
-- parentage: relative_name, NULL if relative_name is NULL or empty
-- relationType: relation_type, NULL if relation_type is NULL or empty
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
-- noOfCrimes: count of crimes in crimes table
SELECT
  a.accused_id AS id,
  c.crime_id AS "crimeId",
  COALESCE(adt_main.canonical_person_id, a.person_id) AS "personId",
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
  c.fir_date AS "crimeRegDate",
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
  (COALESCE(acccount.count, (0)::bigint))::integer AS "noOfAccusedInvolved",
  COALESCE(acccount.details, '[]'::jsonb) AS "accusedDetails",
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.accused_code
    ),
    ''::text
  ) AS "accusedCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.seq_num
    ),
    ''::text
  ) AS "seqNum",
  a.is_ccl AS "isCCL",
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.beard
    ),
    ''::text
  ) AS beard,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.build
    ),
    ''::text
  ) AS build,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.color
    ),
    ''::text
  ) AS color,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.ear
    ),
    ''::text
  ) AS ear,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.eyes
    ),
    ''::text
  ) AS eyes,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.face
    ),
    ''::text
  ) AS face,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.hair
    ),
    ''::text
  ) AS hair,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.height
    ),
    ''::text
  ) AS height,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.leucoderma
    ),
    ''::text
  ) AS leucoderma,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.mole
    ),
    ''::text
  ) AS mole,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.mustache
    ),
    ''::text
  ) AS mustache,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.nose
    ),
    ''::text
  ) AS nose,
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.teeth
    ),
    ''::text
  ) AS teeth,
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
  END AS "accusedStatus",
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
    ELSE TRIM(
      BOTH
      FROM
        bfa.accused_type
    )
  END AS "accusedType",
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
        p.alias
    ),
    ''::text
  ) AS alias,
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
  ) AS parentage,
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
  (COALESCE(crimecount.count, (0)::bigint))::integer AS "noOfCrimes",
  COALESCE(prevcases.cases, '[]'::jsonb) AS "previouslyInvolvedCases",
  COALESCE(drug_types.types, '{}'::text[]) AS "drugType",
  COALESCE(drug_quantities.types, '[]'::jsonb) AS "drugWithQuantity"
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
                        accused a
                        LEFT JOIN agent_deduplication_tracker adt_main ON (
                          (
                            (a.person_id)::text = ANY (adt_main.all_person_ids)
                          )
                        )
                      )
                      LEFT JOIN persons p ON (((p.person_id)::text = (a.person_id)::text))
                    )
                    LEFT JOIN crimes c ON (((c.crime_id)::text = (a.crime_id)::text))
                  )
                  LEFT JOIN arrests ar ON (
                    (
                      ((ar.crime_id)::text = (c.crime_id)::text)
                      AND (ar.accused_seq_no = (a.seq_num)::text)
                    )
                  )
                )
                LEFT JOIN hierarchy h ON (((h.ps_code)::text = (c.ps_code)::text))
              )
              LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
            )
            LEFT JOIN (
              SELECT
                c1.crime_id,
                count(a1.accused_id) AS count,
                jsonb_agg(
                  jsonb_build_object(
                    'id',
                    p1.person_id,
                    'accusedId',
                    a1.accused_id,
                    'accusedCode',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.accused_code
                      ),
                      ''::text
                    ),
                    'seqNum',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.seq_num
                      ),
                      ''::text
                    ),
                    'isCCL',
                    a1.is_ccl,
                    'beard',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.beard
                      ),
                      ''::text
                    ),
                    'build',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.build
                      ),
                      ''::text
                    ),
                    'color',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.color
                      ),
                      ''::text
                    ),
                    'ear',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.ear
                      ),
                      ''::text
                    ),
                    'eyes',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.eyes
                      ),
                      ''::text
                    ),
                    'face',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.face
                      ),
                      ''::text
                    ),
                    'hair',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.hair
                      ),
                      ''::text
                    ),
                    'height',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.height
                      ),
                      ''::text
                    ),
                    'leucoderma',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.leucoderma
                      ),
                      ''::text
                    ),
                    'mole',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.mole
                      ),
                      ''::text
                    ),
                    'mustache',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.mustache
                      ),
                      ''::text
                    ),
                    'nose',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.nose
                      ),
                      ''::text
                    ),
                    'teeth',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          a1.teeth
                      ),
                      ''::text
                    ),
                    'name',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.name)::text
                      ),
                      ''::text
                    ),
                    'surname',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.surname)::text
                      ),
                      ''::text
                    ),
                    'alias',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.alias)::text
                      ),
                      ''::text
                    ),
                    'fullName',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.full_name)::text
                      ),
                      ''::text
                    ),
                    'relativeName',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.relative_name)::text
                      ),
                      ''::text
                    ),
                    'emailId',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (p1.email_id)::text
                      ),
                      ''::text
                    ),
                    'status',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (bfa1.status)::text
                      ),
                      ''::text
                    ),
                    'type',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          (bfa1.accused_type)::text
                      ),
                      ''::text
                    ),
                    'value',
                    COALESCE(
                      NULLIF(
                        TRIM(
                          BOTH
                          FROM
                            COALESCE(p1.full_name, p1.name)
                        ),
                        ''::text
                      ),
                      ''::text
                    ),
                    'houseNo',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_house_no
                      ),
                      ''::text
                    ),
                    'streetRoadNo',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_street_road_no
                      ),
                      ''::text
                    ),
                    'wardColony',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_ward_colony
                      ),
                      ''::text
                    ),
                    'landmarkMilestone',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_landmark_milestone
                      ),
                      ''::text
                    ),
                    'localityVillage',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_locality_village
                      ),
                      ''::text
                    ),
                    'areaMandal',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_area_mandal
                      ),
                      ''::text
                    ),
                    'district',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_district
                      ),
                      ''::text
                    ),
                    'stateUT',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_state_ut
                      ),
                      ''::text
                    ),
                    'country',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_country
                      ),
                      ''::text
                    ),
                    'residencyType',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_residency_type
                      ),
                      ''::text
                    ),
                    'pinCode',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_pin_code
                      ),
                      ''::text
                    ),
                    'jurisdictionPS',
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          p1.permanent_jurisdiction_ps
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
                        accused a1
                        JOIN crimes c1 ON (((c1.crime_id)::text = (a1.crime_id)::text))
                      )
                      JOIN agent_deduplication_tracker adt1 ON (
                        ((a1.person_id)::text = ANY (adt1.all_person_ids))
                      )
                    )
                    LEFT JOIN persons p1 ON (((p1.person_id)::text = (a1.person_id)::text))
                  )
                  LEFT JOIN brief_facts_accused bfa1 ON (((bfa1.accused_id)::text = (a1.accused_id)::text))
                )
              GROUP BY
                c1.crime_id
            ) acccount ON (((acccount.crime_id)::text = (c.crime_id)::text))
          )
          LEFT JOIN (
            SELECT
              COALESCE(adt2.canonical_person_id, a2.person_id) AS person_id,
              count(a2.accused_id) AS count
            FROM
              (
                (
                  accused a2
                  LEFT JOIN agent_deduplication_tracker adt2 ON (
                    ((a2.person_id)::text = ANY (adt2.all_person_ids))
                  )
                )
                LEFT JOIN persons p2 ON (((p2.person_id)::text = (a2.person_id)::text))
              )
            GROUP BY
              COALESCE(adt2.canonical_person_id, a2.person_id)
          ) crimecount ON (
            (
              (crimecount.person_id)::text = (
                COALESCE(adt_main.canonical_person_id, a.person_id)
              )::text
            )
          )
        )
        LEFT JOIN (
          SELECT
            COALESCE(adt3.canonical_person_id, a3.person_id) AS person_id,
            jsonb_agg(
              jsonb_build_object(
                'id',
                c3.crime_id,
                'value',
                concat(
                  COALESCE(
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          c3.fir_num
                      ),
                      ''::text
                    ),
                    ''::text
                  ),
                  ' of ',
                  COALESCE(
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          h3.ps_name
                      ),
                      ''::text
                    ),
                    ''::text
                  ),
                  ' of ',
                  COALESCE(
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          h3.dist_name
                      ),
                      ''::text
                    ),
                    ''::text
                  ),
                  ' (',
                  COALESCE(
                    NULLIF(
                      TRIM(
                        BOTH
                        FROM
                          c3.case_status
                      ),
                      ''::text
                    ),
                    ''::text
                  ),
                  ')'
                )
              )
            ) AS cases
          FROM
            (
              (
                (
                  (
                    (
                      accused a3
                      LEFT JOIN agent_deduplication_tracker adt3 ON (
                        ((a3.person_id)::text = ANY (adt3.all_person_ids))
                      )
                    )
                    LEFT JOIN persons p3 ON (((p3.person_id)::text = (a3.person_id)::text))
                  )
                  JOIN crimes c3 ON (((c3.crime_id)::text = (a3.crime_id)::text))
                )
                LEFT JOIN brief_facts_accused b3 ON (((b3.accused_id)::text = (a3.accused_id)::text))
              )
              LEFT JOIN hierarchy h3 ON (((h3.ps_code)::text = (c3.ps_code)::text))
            )
          GROUP BY
            COALESCE(adt3.canonical_person_id, a3.person_id)
        ) prevcases ON (
          (
            (prevcases.person_id)::text = (
              COALESCE(adt_main.canonical_person_id, a.person_id)
            )::text
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
          (
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
            AND (
              (bfd.primary_drug_name)::text <> 'NO_DRUGS_DETECTED'::text
            )
          )
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
                        round(bfd.standardized_weight_kg, 2)::text
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
                        round(bfd.standardized_volume_ml, 2)::text
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
                        round(bfd.standardized_count, 2)::text
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
        (
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
          AND (
            (bfd.primary_drug_name)::text <> 'NO_DRUGS_DETECTED'::text
          )
        )
      GROUP BY
        bfd.crime_id
    ) drug_quantities ON (
      (
        (drug_quantities.crime_id)::text = (c.crime_id)::text
      )
    )
  );