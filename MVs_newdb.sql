-- ========================================================================
-- MATERIALIZED VIEW RECONSTRUCTION - STRICT SCHEMA COMPATIBILITY
-- ========================================================================

-- Drop existing views (CASCADE handles dependencies)
DROP MATERIALIZED VIEW IF EXISTS criminal_profiles_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS advanced_search_firs_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS advanced_search_accuseds_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS firs_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS accuseds_mv CASCADE;

-- ========================================================================
-- VIEW: accuseds_mv
-- ========================================================================
CREATE MATERIALIZED VIEW accuseds_mv AS
SELECT 
  a.accused_id AS id,
  h.dist_name AS unit,
  h.ps_name AS ps,
  EXTRACT(YEAR FROM c.fir_date)::int AS year,
  c.crime_id AS "crimeId",
  p.person_id AS "personId",
  c.fir_num AS "firNumber",
  c.fir_reg_num AS "firRegNum",
  c.acts_sections AS section,
  c.fir_date AS "crimeRegDate",
  c.brief_facts AS "briefFacts",
  a.accused_code AS "accusedCode",
  a.seq_num AS "seqNum",
  a.is_ccl AS "isCCL",
  a.beard, a.build, a.color, a.ear, a.eyes, a.face, a.hair, a.height, a.leucoderma, a.mole, a.mustache, a.nose, a.teeth,
  COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus",
  a.type AS "accusedType",
  (SELECT COUNT(*) FROM accused a3 WHERE a3.crime_id = c.crime_id) AS "noOfAccusedInvolved",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', p2.name,
        'surname', p2.surname,
        'alias', p2.alias,
        'fullName', p2.full_name,
        'status', COALESCE(bfa2.status, a2.accused_status, 'Unknown'),
        'email', p2.email_id
      )
    )
    FROM accused a2
    LEFT JOIN persons p2 ON a2.person_id = p2.person_id
    LEFT JOIN brief_facts_accused bfa2 ON a2.accused_id = bfa2.accused_id
    WHERE a2.crime_id = c.crime_id
  ) AS "accusedDetails",
  p.name, p.surname, p.alias, p.full_name AS "fullName", p.relative_name AS "parentage",
  p.domicile_classification AS "domicile", p.relation_type AS "relationType", p.gender, p.is_died AS "isDied",
  p.date_of_birth AS "dateOfBirth", p.age, p.occupation, p.education_qualification AS "educationQualification",
  p.caste, p.sub_caste AS "subCaste", p.religion, p.nationality, p.designation, p.place_of_work AS "placeOfWork",
  p.present_house_no AS "presentHouseNo", p.present_street_road_no AS "presentStreetRoadNo", p.present_ward_colony AS "presentWardColony", 
  p.present_landmark_milestone AS "presentLandmarkMilestone", p.present_locality_village AS "presentLocalityVillage", 
  p.present_area_mandal AS "presentAreaMandal", p.present_district AS "presentDistrict", p.present_state_ut AS "presentStateUt", 
  p.present_country AS "presentCountry", p.present_residency_type AS "presentResidencyType", p.present_pin_code AS "presentPinCode", 
  p.present_jurisdiction_ps AS "presentJurisdictionPs",
  p.permanent_house_no AS "permanentHouseNo", p.permanent_street_road_no AS "permanentStreetRoadNo", p.permanent_ward_colony AS "permanentWardColony", 
  p.permanent_landmark_milestone AS "permanentLandmarkMilestone", p.permanent_locality_village AS "permanentLocalityVillage", 
  p.permanent_area_mandal AS "permanentAreaMandal", p.permanent_district AS "permanentDistrict", p.permanent_state_ut AS "permanentStateUt", 
  p.permanent_country AS "permanentCountry", p.permanent_residency_type AS "permanentResidencyType", p.permanent_pin_code AS "permanentPinCode", 
  p.permanent_jurisdiction_ps AS "permanentJurisdictionPs",
  p.phone_number AS "phoneNumber", p.country_code AS "countryCode", p.email_id AS "emailId",
  CONCAT_WS(', ', NULLIF(p.present_house_no, ''), NULLIF(p.present_street_road_no, ''), NULLIF(p.present_ward_colony, ''), NULLIF(p.present_locality_village, ''), NULLIF(p.present_district, ''), NULLIF(p.present_state_ut, ''), NULLIF(p.present_pin_code, '')) AS "presentAddress",
  CONCAT_WS(', ', NULLIF(p.permanent_house_no, ''), NULLIF(p.permanent_street_road_no, ''), NULLIF(p.permanent_ward_colony, ''), NULLIF(p.permanent_locality_village, ''), NULLIF(p.permanent_district, ''), NULLIF(p.permanent_state_ut, ''), NULLIF(p.permanent_pin_code, '')) AS "permanentAddress",
  (SELECT COUNT(*) FROM accused a3 WHERE a3.person_id = p.person_id) AS "noOfCrimes",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('crimeId', c2.crime_id, 'firNumber', c2.fir_num))
    FROM accused a4
    INNER JOIN crimes c2 ON a4.crime_id = c2.crime_id
    WHERE a4.person_id = p.person_id
  ) AS "previouslyInvolvedCases",
  (
    SELECT COALESCE(
      ARRAY_AGG(DISTINCT UPPER(TRIM(bfd.primary_drug_name))) FILTER (WHERE bfd.primary_drug_name IS NOT NULL AND bfd.primary_drug_name != 'NO_DRUGS_DETECTED'),
      ARRAY[]::text[]
    )
    FROM brief_facts_drug bfd 
    WHERE bfd.crime_id = c.crime_id
  ) AS "drugType",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd2.primary_drug_name,
        'quantityKg', COALESCE(bfd2.weight_kg, 0),
        'quantityMl', COALESCE(bfd2.volume_ml, 0),
        'quantityCount', COALESCE(bfd2.count_total, 0),
        'worth', COALESCE(bfd2.seizure_worth, 0)
      ) ORDER BY bfd2.id
    )
    FROM brief_facts_drug bfd2
    WHERE bfd2.crime_id = c.crime_id
  ) AS "drugWithQuantity",
  c.class_classification AS "caseClassification",
  c.case_status AS "caseStatus"
FROM accused a
INNER JOIN crimes c ON a.crime_id = c.crime_id
INNER JOIN hierarchy h ON c.ps_code = h.ps_code
LEFT JOIN persons p ON a.person_id = p.person_id
LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
WITH DATA;

CREATE UNIQUE INDEX idx_accuseds_mv_id ON accuseds_mv (id);
CREATE INDEX idx_accuseds_mv_crimeId ON accuseds_mv ("crimeId");
CREATE INDEX idx_accuseds_mv_year ON accuseds_mv (year);
CREATE INDEX idx_accuseds_mv_unit ON accuseds_mv (unit);
CREATE INDEX idx_accuseds_mv_ps ON accuseds_mv (ps);

-- ========================================================================
-- VIEW: firs_mv
-- ========================================================================
CREATE MATERIALIZED VIEW firs_mv AS
SELECT 
  c.crime_id AS id,
  h.dist_name AS unit,
  h.ps_name AS ps,
  EXTRACT(YEAR FROM c.fir_date)::int AS year,
  c.fir_num AS "firNumber",
  c.fir_reg_num AS "firRegNum",
  c.acts_sections AS section,
  c.fir_type AS "firType",
  c.crime_type AS "crimeType",
  c.fir_date AS "crimeRegDate",
  c.major_head AS "majorHead",
  c.minor_head AS "minorHead",
  c.io_name AS "ioName",
  c.io_rank AS "ioRank",
  c.brief_facts AS "briefFacts",
  (SELECT COUNT(*) FROM accused a3 WHERE a3.crime_id = c.crime_id) AS "noOfAccusedInvolved",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', p.name,
        'surname', p.surname,
        'alias', p.alias,
        'fullName', p.full_name,
        'status', COALESCE(bfa.status, a.accused_status, 'Unknown'),
        'email', p.email_id
      )
    )
    FROM accused a
    LEFT JOIN persons p ON a.person_id = p.person_id
    LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
    WHERE a.crime_id = c.crime_id
  ) AS "accusedDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('type', p2.category, 'value', p2.estimate_value))
    FROM properties p2
    WHERE p2.crime_id = c.crime_id
  ) AS "propertyDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('type', mo.type, 'quantity', mo.description))
    FROM mo_seizures mo
    WHERE mo.crime_id = c.crime_id
  ) AS "moSeizuresDetails",
  (
    SELECT COALESCE(
      ARRAY_AGG(DISTINCT UPPER(TRIM(bfd.primary_drug_name))) FILTER (WHERE bfd.primary_drug_name IS NOT NULL AND bfd.primary_drug_name != 'NO_DRUGS_DETECTED'),
      ARRAY[]::text[]
    )
    FROM brief_facts_drug bfd 
    WHERE bfd.crime_id = c.crime_id
  ) AS "drugType",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd2.primary_drug_name,
        'quantityKg', COALESCE(bfd2.weight_kg, 0),
        'quantityMl', COALESCE(bfd2.volume_ml, 0),
        'quantityCount', COALESCE(bfd2.count_total, 0),
        'worth', COALESCE(bfd2.seizure_worth, 0)
      ) ORDER BY bfd2.id
    )
    FROM brief_facts_drug bfd2
    WHERE bfd2.crime_id = c.crime_id
  ) AS "drugWithQuantity",
  c.class_classification AS "caseClassification",
  c.case_status AS "caseStatus",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', cs.id, 'chargeSheetDate', cs.chargesheet_date))
    FROM chargesheets cs
    WHERE cs.crime_id = c.crime_id
  ) AS "chargesheets",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', csu.id, 'updateDate', csu.date_created))
    FROM charge_sheet_updates csu
    WHERE csu.crime_id = c.crime_id
  ) AS "chargesheetUpdates",
  NULL AS "stipulatedPeriodForCS",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f.file_path))
    FROM files f
    WHERE f.parent_id = c.crime_id AND f.source_type = 'crime' AND f.source_field = 'FIR_COPY'
  ) AS "documents",
  c.fir_copy AS "firCopy",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f.file_path))
    FROM files f
    INNER JOIN properties prop ON f.parent_id = prop.property_id
    WHERE prop.crime_id = c.crime_id AND f.source_type = 'property' AND f.source_field = 'MEDIA'
  ) AS "propertyDocuments",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f.file_path))
    FROM files f
    INNER JOIN interrogation_reports ir ON f.parent_id = ir.interrogation_report_id
    WHERE ir.crime_id = c.crime_id AND f.source_type = 'interrogation'
  ) AS "irDocuments",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', d.id, 'disposalType', d.disposal_type))
    FROM disposal d
    WHERE d.crime_id = c.crime_id
  ) AS "disposalDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', ir.interrogation_report_id, 'details', ir.socio_occupation))
    FROM interrogation_reports ir
    WHERE ir.crime_id = c.crime_id
  ) AS "irDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', fcp.case_property_id, 'propertyType', fcp.case_type))
    FROM fsl_case_property fcp
    WHERE fcp.crime_id = c.crime_id
  ) AS "casePropertyDetails"
FROM crimes c
INNER JOIN hierarchy h ON c.ps_code = h.ps_code
WITH DATA;

CREATE UNIQUE INDEX idx_firs_mv_id ON firs_mv (id);
CREATE INDEX idx_firs_mv_year ON firs_mv (year);
CREATE INDEX idx_firs_mv_unit ON firs_mv (unit);
CREATE INDEX idx_firs_mv_ps ON firs_mv (ps);
CREATE INDEX idx_firs_mv_firNumber ON firs_mv ("firNumber");
CREATE INDEX idx_firs_mv_caseStatus ON firs_mv ("caseStatus");
CREATE INDEX idx_firs_mv_crimeType ON firs_mv ("crimeType");

-- ========================================================================
-- VIEW: advanced_search_accuseds_mv
-- ========================================================================
CREATE MATERIALIZED VIEW advanced_search_accuseds_mv AS
SELECT 
  a.accused_id AS id,
  a.accused_code AS "accusedCode",
  a.type,
  a.seq_num AS "seqNum",
  a.is_ccl AS "isCCL",
  a.beard, a.build, a.color, a.ear, a.eyes, a.face, a.hair, a.height, a.leucoderma, a.mole, a.mustache, a.nose, a.teeth,
  a.type AS "accusedType",
  COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus",
  h.ps_code AS "psCode",
  c.fir_num AS "firNum",
  c.fir_reg_num AS "firRegNum",
  c.fir_type AS "firType",
  c.acts_sections AS "sections",
  c.fir_date AS "firDate",
  c.case_status AS "caseStatus",
  c.class_classification AS "caseClass",
  c.major_head AS "majorHead",
  c.minor_head AS "minorHead",
  c.crime_type AS "crimeType",
  c.io_name AS "ioName",
  c.io_rank AS "ioRank",
  c.brief_facts AS "briefFacts",
  h.ps_name AS "psName",
  h.circle_code AS "circleCode", h.circle_name AS "circleName",
  h.sdpo_code AS "sdpoCode", h.sdpo_name AS "sdpoName",
  h.sub_zone_code AS "subZoneCode", h.sub_zone_name AS "subZoneName",
  h.dist_code AS "distCode", h.dist_name AS "distName",
  h.range_code AS "rangeCode", h.range_name AS "rangeName",
  h.zone_code AS "zoneCode", h.zone_name AS "zoneName",
  h.adg_code AS "adgCode", h.adg_name AS "adgName",
  p.name, p.surname, p.alias, p.full_name AS "fullName",
  p.relation_type AS "relationType", p.relative_name AS "relativeName",
  p.gender, p.is_died AS "isDied", p.date_of_birth AS "dateOfBirth", p.age,
  p.occupation, p.education_qualification AS "educationQualification", p.caste, p.sub_caste AS "subCaste",
  p.religion, p.domicile_classification AS "domicile", p.nationality, p.designation, p.place_of_work AS "placeOfWork",
  p.present_house_no AS "presentHouseNo", p.present_street_road_no AS "presentStreetRoadNo", p.present_ward_colony AS "presentWardColony", 
  p.present_landmark_milestone AS "presentLandmarkMilestone", p.present_locality_village AS "presentLocalityVillage", 
  p.present_area_mandal AS "presentAreaMandal", p.present_district AS "presentDistrict", p.present_state_ut AS "presentStateUt", 
  p.present_country AS "presentCountry", p.present_residency_type AS "presentResidencyType", p.present_pin_code AS "presentPinCode", 
  p.present_jurisdiction_ps AS "presentJurisdictionPs",
  p.permanent_house_no AS "permanentHouseNo", p.permanent_street_road_no AS "permanentStreetRoadNo", p.permanent_ward_colony AS "permanentWardColony", 
  p.permanent_landmark_milestone AS "permanentLandmarkMilestone", p.permanent_locality_village AS "permanentLocalityVillage", 
  p.permanent_area_mandal AS "permanentAreaMandal", p.permanent_district AS "permanentDistrict", p.permanent_state_ut AS "permanentStateUt", 
  p.permanent_country AS "permanentCountry", p.permanent_residency_type AS "permanentResidencyType", p.permanent_pin_code AS "permanentPinCode", 
  p.permanent_jurisdiction_ps AS "permanentJurisdictionPs",
  p.phone_number AS "phoneNumber", p.country_code AS "countryCode", p.email_id AS "emailId",
  CONCAT_WS(', ', NULLIF(p.present_house_no, ''), NULLIF(p.present_street_road_no, ''), NULLIF(p.present_ward_colony, ''), NULLIF(p.present_locality_village, ''), NULLIF(p.present_district, ''), NULLIF(p.present_state_ut, ''), NULLIF(p.present_pin_code, '')) AS "presentAddress",
  CONCAT_WS(', ', NULLIF(p.permanent_house_no, ''), NULLIF(p.permanent_street_road_no, ''), NULLIF(p.permanent_ward_colony, ''), NULLIF(p.permanent_locality_village, ''), NULLIF(p.permanent_district, ''), NULLIF(p.permanent_state_ut, ''), NULLIF(p.permanent_pin_code, '')) AS "permanentAddress",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd.primary_drug_name,
        'quantityKg', COALESCE(bfd.weight_kg, 0),
        'quantityMl', COALESCE(bfd.volume_ml, 0),
        'quantityCount', COALESCE(bfd.count_total, 0),
        'worth', COALESCE(bfd.seizure_worth, 0)
      ) ORDER BY bfd.id
    )
    FROM brief_facts_drug bfd
    WHERE bfd.crime_id = c.crime_id
  ) AS "drugDetails",
  NULL AS "stipulatedPeriodForCS"
FROM accused a
INNER JOIN crimes c ON a.crime_id = c.crime_id
INNER JOIN hierarchy h ON c.ps_code = h.ps_code
LEFT JOIN persons p ON a.person_id = p.person_id
LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
WITH DATA;

CREATE UNIQUE INDEX idx_advanced_search_accuseds_mv_id ON advanced_search_accuseds_mv (id);
CREATE INDEX idx_advanced_search_accuseds_mv_firNum ON advanced_search_accuseds_mv ("firNum");
CREATE INDEX idx_advanced_search_accuseds_mv_firDate ON advanced_search_accuseds_mv ("firDate");

-- ========================================================================
-- VIEW: advanced_search_firs_mv
-- ========================================================================
CREATE MATERIALIZED VIEW advanced_search_firs_mv AS
SELECT 
  c.crime_id AS id,
  h.ps_code AS "psCode",
  c.fir_num AS "firNum",
  c.fir_reg_num AS "firRegNum",
  c.fir_type AS "firType",
  c.acts_sections AS "sections",
  c.fir_date AS "firDate",
  c.case_status AS "caseStatus",
  c.class_classification AS "caseClass",
  c.major_head AS "majorHead",
  c.minor_head AS "minorHead",
  c.crime_type AS "crimeType",
  c.io_name AS "ioName",
  c.io_rank AS "ioRank",
  c.brief_facts AS "briefFacts",
  h.ps_name AS "psName",
  h.circle_code AS "circleCode", h.circle_name AS "circleName",
  h.sdpo_code AS "sdpoCode", h.sdpo_name AS "sdpoName",
  h.sub_zone_code AS "subZoneCode", h.sub_zone_name AS "subZoneName",
  h.dist_code AS "distCode", h.dist_name AS "distName",
  h.range_code AS "rangeCode", h.range_name AS "rangeName",
  h.zone_code AS "zoneCode", h.zone_name AS "zoneName",
  h.adg_code AS "adgCode", h.adg_name AS "adgName",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd.primary_drug_name,
        'quantityKg', COALESCE(bfd.weight_kg, 0),
        'quantityMl', COALESCE(bfd.volume_ml, 0),
        'quantityCount', COALESCE(bfd.count_total, 0),
        'worth', COALESCE(bfd.seizure_worth, 0)
      ) ORDER BY bfd.id
    )
    FROM brief_facts_drug bfd
    WHERE bfd.crime_id = c.crime_id
  ) AS "drugDetails",
  NULL AS "stipulatedPeriodForCS"
FROM crimes c
INNER JOIN hierarchy h ON c.ps_code = h.ps_code
WITH DATA;

CREATE UNIQUE INDEX idx_advanced_search_firs_mv_id ON advanced_search_firs_mv (id);
CREATE INDEX idx_advanced_search_firs_mv_firNum ON advanced_search_firs_mv ("firNum");
CREATE INDEX idx_advanced_search_firs_mv_firDate ON advanced_search_firs_mv ("firDate");

-- ========================================================================
-- VIEW: criminal_profiles_mv
-- ========================================================================
CREATE MATERIALIZED VIEW criminal_profiles_mv AS
SELECT 
  p.person_id AS id,
  p.alias,
  p.name,
  p.surname,
  p.full_name AS "fullName",
  p.relation_type AS "relationType",
  p.relative_name AS "relativeName",
  p.gender,
  p.is_died AS "isDied",
  p.date_of_birth AS "dateOfBirth",
  p.age,
  p.domicile_classification AS "domicile",
  p.occupation,
  p.education_qualification AS "educationQualification",
  p.caste,
  p.sub_caste AS "subCaste",
  p.religion,
  p.nationality,
  p.designation,
  p.place_of_work AS "placeOfWork",
  p.present_house_no AS "presentHouseNo", p.present_street_road_no AS "presentStreetRoadNo", p.present_ward_colony AS "presentWardColony", 
  p.present_landmark_milestone AS "presentLandmarkMilestone", p.present_locality_village AS "presentLocalityVillage", 
  p.present_area_mandal AS "presentAreaMandal", p.present_district AS "presentDistrict", p.present_state_ut AS "presentStateUt", 
  p.present_country AS "presentCountry", p.present_residency_type AS "presentResidencyType", p.present_pin_code AS "presentPinCode", 
  p.present_jurisdiction_ps AS "presentJurisdictionPs",
  p.permanent_house_no AS "permanentHouseNo", p.permanent_street_road_no AS "permanentStreetRoadNo", p.permanent_ward_colony AS "permanentWardColony", 
  p.permanent_landmark_milestone AS "permanentLandmarkMilestone", p.permanent_locality_village AS "permanentLocalityVillage", 
  p.permanent_area_mandal AS "permanentAreaMandal", p.permanent_district AS "permanentDistrict", p.permanent_state_ut AS "permanentStateUt", 
  p.permanent_country AS "permanentCountry", p.permanent_residency_type AS "permanentResidencyType", p.permanent_pin_code AS "permanentPinCode", 
  p.permanent_jurisdiction_ps AS "permanentJurisdictionPs",
  p.phone_number AS "phoneNumber",
  p.country_code AS "countryCode",
  p.email_id AS "emailId",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'identityType', f.identity_type, 'identityNumber', f.identity_number, 'filePath', f.file_path))
    FROM files f
    WHERE f.parent_id = p.person_id AND f.source_type = 'person' AND f.source_field = 'IDENTITY_DETAILS'
  ) AS "identityDocuments",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f.file_path))
    FROM files f
    WHERE f.parent_id = p.person_id AND f.source_type = 'person' AND f.source_field = 'MEDIA'
  ) AS "documents",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', c.crime_id, 'firNumber', c.fir_num, 'crimeRegDate', c.fir_date))
    FROM accused a
    INNER JOIN crimes c ON a.crime_id = c.crime_id
    WHERE a.person_id = p.person_id
  ) AS crimes,
  (SELECT MAX(c.crime_id) FROM accused a INNER JOIN crimes c ON a.crime_id = c.crime_id WHERE a.person_id = p.person_id) AS "latestCrimeId",
  (SELECT MAX(c.fir_num) FROM accused a INNER JOIN crimes c ON a.crime_id = c.crime_id WHERE a.person_id = p.person_id) AS "latestCrimeNo",
  (SELECT COUNT(DISTINCT a.crime_id)::bigint FROM accused a WHERE a.person_id = p.person_id) AS "noOfCrimes",
  (
    SELECT COUNT(*)::bigint
    FROM arrests arr
    WHERE arr.person_id = p.person_id AND arr.is_arrested = true
  ) AS "arrestCount",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('crimeId', c.crime_id, 'firNumber', c.fir_num))
    FROM accused a
    INNER JOIN crimes c ON a.crime_id = c.crime_id
    WHERE a.person_id = p.person_id
  ) AS "previouslyInvolvedCases",
  (
    SELECT COALESCE(
      ARRAY_AGG(DISTINCT UPPER(TRIM(bfd.primary_drug_name))) FILTER (WHERE bfd.primary_drug_name IS NOT NULL AND bfd.primary_drug_name != 'NO_DRUGS_DETECTED'),
      ARRAY[]::text[]
    )
    FROM brief_facts_drug bfd
    INNER JOIN accused a_drug ON bfd.crime_id = a_drug.crime_id
    WHERE a_drug.person_id = p.person_id
  ) AS "associatedDrugs",
  ARRAY[]::text[] AS "DOPAMSLinks",
  NULL AS "counselled",
  ARRAY[]::text[] AS "socialMedia",
  NULL AS "RTAData",
  NULL AS "bankAcountDetails",
  NULL AS "passportDetails_Foreigners",
  NULL AS "purposeOfVISA_Foreigners",
  NULL AS "validityOfVISA_Foreigners",
  NULL AS "localaddress_Foreigners",
  NULL AS "nativeAddress_Foreigners",
  NULL AS "statusOfTheAccused",
  NULL AS "historySheet",
  NULL AS "propertyForfeited",
  NULL AS "PITNDPSInitiated"
FROM persons p
WITH DATA;

CREATE UNIQUE INDEX idx_criminal_profiles_mv_id ON criminal_profiles_mv (id);
CREATE INDEX idx_criminal_profiles_mv_fullName ON criminal_profiles_mv ("fullName");
CREATE INDEX idx_criminal_profiles_mv_noOfCrimes ON criminal_profiles_mv ("noOfCrimes");