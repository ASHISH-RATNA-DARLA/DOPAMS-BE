SELECT
  p.person_id AS id,
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
        p.relation_type
    ),
    ''::text
  ) AS "relationType",
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
        p.gender
    ),
    ''::text
  ) AS gender,
  p.is_died AS "isDied",
  p.date_of_birth AS "dateOfBirth",
  p.age,
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
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.nationality
    ),
    ''::text
  ) AS nationality,
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
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.present_state_ut
    ),
    ''::text
  ) AS "presentStateUt",
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
  NULLIF(
    TRIM(
      BOTH
      FROM
        p.permanent_state_ut
    ),
    ''::text
  ) AS "permanentStateUt",
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
  COALESCE(crimes_details.details, '[]'::jsonb) AS crimes
FROM
  (
    (
      (
        persons p
        LEFT JOIN (
          SELECT
            ordered_crimes.person_id,
            jsonb_agg(ordered_crimes.crime_data) AS details
          FROM
            (
              SELECT
                a.person_id,
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
                  'crimeId',
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
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        bfa.accused_type
                    ),
                    ''::text
                  ),
                  'accusedStatus',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        bfa.status
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
                  'noOfAccusedInvolved',
                  COALESCE(accused_count.count, 0),
                  'caseStatus',
                  NULLIF(
                    TRIM(
                      BOTH
                      FROM
                        c.case_status
                    ),
                    ''::text
                  )
                ) AS crime_data,
                c.fir_date
              FROM
                (
                  (
                    (
                      (
                        accused a
                        LEFT JOIN crimes c ON (((c.crime_id)::text = (a.crime_id)::text))
                      )
                      LEFT JOIN hierarchy h ON (((h.ps_code)::text = (c.ps_code)::text))
                    )
                    LEFT JOIN brief_facts_accused bfa ON (((bfa.accused_id)::text = (a.accused_id)::text))
                  )
                  LEFT JOIN (
                    SELECT
                      c1.crime_id,
                      (count(a1.accused_id))::integer AS count
                    FROM
                      (
                        accused a1
                        JOIN crimes c1 ON (((c1.crime_id)::text = (a1.crime_id)::text))
                      )
                    GROUP BY
                      c1.crime_id
                  ) accused_count ON (
                    (
                      (accused_count.crime_id)::text = (c.crime_id)::text
                    )
                  )
                )
              ORDER BY
                a.person_id,
                c.fir_date DESC NULLS LAST
            ) ordered_crimes
          GROUP BY
            ordered_crimes.person_id
        ) crimes_details ON (
          (
            (crimes_details.person_id)::text = (p.person_id)::text
          )
        )
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