-- id: accused_id UNIQUE NOT NULL
-- accusedCode: accused_code, NULL if accused_code is NULL or empty
-- type: type, NULL if accused_code is NULL or empty
-- seqNum: seq_num, NULL if accused_code is NULL or empty
-- isCCL: is_ccl
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
-- accusedType: accused_type, UNKNOWN if accused_type is NULL or empty
-- accusedStatus: status, UNKNOWN if status is NULL or empty
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
-- name: name, NULL if name is NULL or empty
-- surname: surname, NULL if surname is NULL or empty
-- alias: alias, NULL if alias is NULL or empty
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
-- presentStateUt: present_state_ut, UNKNOWN if present_state_ut is NULL or empty
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
-- presentAddress: present_address, NULL if present_address is NULL or empty
-- permanentAddress: permanent_address, NULL if permanent_address is NULL or empty
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
        a.accused_code
    ),
    ''::text
  ) AS "accusedCode",
  NULLIF(
    TRIM(
      BOTH
      FROM
        a.type
    ),
    ''::text
  ) AS TYPE,
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
  END AS "accusedType",
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
  TRIM(
    BOTH
    FROM
      concat_ws(
        ', '::text,
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_house_no
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_street_road_no
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_ward_colony
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_landmark_milestone
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_locality_village
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_area_mandal
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_district
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_state_ut
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_country
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_residency_type
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_pin_code
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.present_jurisdiction_ps
          ),
          ''::text
        )
      )
  ) AS "presentAddress",
  TRIM(
    BOTH
    FROM
      concat_ws(
        ', '::text,
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_house_no
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_street_road_no
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_ward_colony
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_landmark_milestone
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_locality_village
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_area_mandal
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_district
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_state_ut
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_country
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_residency_type
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_pin_code
          ),
          ''::text
        ),
        NULLIF(
          TRIM(
            BOTH
            FROM
              p.permanent_jurisdiction_ps
          ),
          ''::text
        )
      )
  ) AS "permanentAddress",
  COALESCE(drug_quantities.types, '[]'::jsonb) AS "drugDetails"
FROM
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
              LEFT JOIN crimes c ON (((a.crime_id)::text = (c.crime_id)::text))
            )
            LEFT JOIN arrests ar ON (
              (
                ((ar.crime_id)::text = (c.crime_id)::text)
                AND (ar.accused_seq_no = (a.seq_num)::text)
              )
            )
          )
          LEFT JOIN hierarchy h ON (((c.ps_code)::text = (h.ps_code)::text))
        )
        LEFT JOIN brief_facts_accused bfa ON (((a.accused_id)::text = (bfa.accused_id)::text))
      )
      LEFT JOIN persons p ON (
        (
          (p.person_id)::text = (
            COALESCE(adt_main.canonical_person_id, a.person_id)
          )::text
        )
      )
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