-- ========================================================================
-- MATERIALIZED VIEW RECONSTRUCTION FROM BACKEND CODE ANALYSIS
-- ========================================================================
-- Generated from analysis of backend source code queries
-- These views are referenced and queried in the following services:
--   - src/schema/accused/services/index.ts
--   - src/schema/firs/services/index.ts
--   - src/schema/advanced-search/services/index.ts
--   - src/schema/criminal-profile/services/index.ts
--   - src/schema/firs/services/seizures.ts
--   - src/schema/home/services/index.ts

-- ========================================================================
-- VIEW: accuseds_mv
-- ========================================================================
-- Used in: getAccused, getAccuseds, getAccusedStatistics, getAccusedFilterValues, getAccusedAbstract
-- Primary columns: id, unit, ps, year, crimeId, crimeRegDate, and all person details
-- Joins: Accused -> Crimes -> Hierarchy + Persons + BriefFactsAccused
-- Group by: Accused with aggregated crime and drug info

CREATE MATERIALIZED VIEW accuseds_mv AS
SELECT 
  a.id,
  h."distName" AS unit,
  h."psName" AS ps,
  EXTRACT(YEAR FROM c."firDate")::int AS year,
  c.id AS "crimeId",
  p.id AS "personId",
  c."crimeNum" AS "firNumber",
  c."firRegNum" AS "firRegNum",
  c."sections" AS section,
  c."firDate" AS "crimeRegDate",
  c."briefFacts",
  a."code" AS "accusedCode",
  a."seqNum",
  a."isCCL",
  a."beard",
  a."build",
  a."color",
  a."ear",
  a."eyes",
  a."face",
  a."hair",
  a."height",
  a."leucoderma",
  a."mole",
  a."mustache",
  a."nose",
  a."teeth",
  COALESCE(bfa."status", 'Unknown') AS "accusedStatus",
  a."type" AS "accusedType",
  c."noOfAccusedInvolved",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', p2."name",
        'surname', p2."surname",
        'alias', p2."alias",
        'fullName', p2."fullName",
        'status', COALESCE(bfa2."status", 'Unknown'),
        'email', p2."emailId"
      )
    )
    FROM "accused" a2
    INNER JOIN "persons" p2 ON a2."personId" = p2.id
    LEFT JOIN "brief_facts_accused" bfa2 ON a2.id = bfa2."accusedId"
    WHERE a2."crimeId" = c.id
  ) AS "accusedDetails",
  p."name",
  p."surname",
  p."alias",
  p."fullName",
  p."relativeName" AS "parentage",
  p."domicile",
  p."relationType",
  p."gender",
  p."isDied",
  p."dateOfBirth",
  p."age",
  p."occupation",
  p."educationQualification",
  p."caste",
  p."subCaste",
  p."religion",
  p."nationality",
  p."designation",
  p."placeOfWork",
  p."presentHouseNo",
  p."presentStreetRoadNo",
  p."presentWardColony",
  p."presentLandmarkMilestone",
  p."presentLocalityVillage",
  p."presentAreaMandal",
  p."presentDistrict",
  p."presentStateUt",
  p."presentCountry",
  p."presentResidencyType",
  p."presentPinCode",
  p."presentJurisdictionPs",
  p."permanentHouseNo",
  p."permanentStreetRoadNo",
  p."permanentWardColony",
  p."permanentLandmarkMilestone",
  p."permanentLocalityVillage",
  p."permanentAreaMandal",
  p."permanentDistrict",
  p."permanentStateUt",
  p."permanentCountry",
  p."permanentResidencyType",
  p."permanentPinCode",
  p."permanentJurisdictionPs",
  p."phoneNumber",
  p."countryCode",
  p."emailId",
  (SELECT COUNT(*) FROM "accused" a3 WHERE a3."personId" = p.id) AS "noOfCrimes",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('crimeId', c2.id, 'firNumber', c2."crimeNum"))
    FROM "accused" a4
    INNER JOIN "crimes" c2 ON a4."crimeId" = c2.id
    WHERE a4."personId" = p.id
  ) AS "previouslyInvolvedCases",
  COALESCE(
    ARRAY_AGG(DISTINCT UPPER(TRIM(bfd."primaryDrugName"))) FILTER (WHERE bfd."primaryDrugName" IS NOT NULL AND bfd."primaryDrugName" != 'NO_DRUGS_DETECTED'),
    ARRAY[]::text[]
  ) AS "drugType",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd2."primaryDrugName",
        'quantityKg', bfd2."standardizedWeightKg",
        'quantityMl', bfd2."standardizedVolumeMl",
        'quantityCount', bfd2."standardizedCount",
        'worth', bfd2."seizureWorth"
      )
    )
    FROM "brief_facts_drug" bfd2
    WHERE bfd2."crimeId" = c.id
  ) AS "drugWithQuantity",
  c."caseClassification",
  c."caseStatus"
FROM "accused" a
INNER JOIN "crimes" c ON a."crimeId" = c.id
INNER JOIN "hierarchy" h ON c."psCode" = h."psCode"
LEFT JOIN "persons" p ON a."personId" = p.id
LEFT JOIN "brief_facts_accused" bfa ON a.id = bfa."accusedId"
LEFT JOIN "brief_facts_drug" bfd ON c.id = bfd."crimeId"
GROUP BY a.id, c.id, p.id, h."distName", h."psName", bfa."status"
WITH DATA;

CREATE INDEX idx_accuseds_mv_id ON accuseds_mv (id);
CREATE INDEX idx_accuseds_mv_crimeId ON accuseds_mv ("crimeId");
CREATE INDEX idx_accuseds_mv_year ON accuseds_mv (year);
CREATE INDEX idx_accuseds_mv_unit ON accuseds_mv (unit);
CREATE INDEX idx_accuseds_mv_ps ON accuseds_mv (ps);

-- ========================================================================
-- VIEW: firs_mv
-- ========================================================================
-- Used in: getFir, getFirs, getFirStatistics, getFirFilterValues, getFirsAbstract, getUiPtCasesStatistics
-- Primary columns: id, unit, ps, year, firNumber, crimeRegDate, caseStatus, caseClassification
-- Joins: Crimes -> Hierarchy + aggregated accused/drug/property data
-- Group by: Crime level aggregation

CREATE MATERIALIZED VIEW firs_mv AS
SELECT 
  c.id,
  h."distName" AS unit,
  h."psName" AS ps,
  EXTRACT(YEAR FROM c."firDate")::int AS year,
  c."crimeNum" AS "firNumber",
  c."firRegNum",
  c."sections" AS section,
  c."firType",
  c."crimeType",
  c."firDate" AS "crimeRegDate",
  c."majorHead",
  c."minorHead",
  c."ioName",
  c."ioRank",
  c."briefFacts",
  c."noOfAccusedInvolved",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', p."name",
        'surname', p."surname",
        'alias', p."alias",
        'fullName', p."fullName",
        'status', COALESCE(bfa."status", 'Unknown'),
        'email', p."emailId"
      )
    )
    FROM "accused" a
    LEFT JOIN "persons" p ON a."personId" = p.id
    LEFT JOIN "brief_facts_accused" bfa ON a.id = bfa."accusedId"
    WHERE a."crimeId" = c.id
  ) AS "accusedDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('type', p2."type", 'value', p2."value"))
    FROM "properties" p2
    WHERE p2."crimeId" = c.id
  ) AS "propertyDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('type', mo."seizureType", 'quantity', mo."quantity"))
    FROM "mo_seizures" mo
    WHERE mo."crimeId" = c.id
  ) AS "moSeizuresDetails",
  COALESCE(
    ARRAY_AGG(DISTINCT UPPER(TRIM(bfd."primaryDrugName"))) FILTER (WHERE bfd."primaryDrugName" IS NOT NULL AND bfd."primaryDrugName" != 'NO_DRUGS_DETECTED'),
    ARRAY[]::text[]
  ) AS "drugType",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd2."primaryDrugName",
        'quantityKg', bfd2."standardizedWeightKg",
        'quantityMl', bfd2."standardizedVolumeMl",
        'quantityCount', bfd2."standardizedCount",
        'worth', bfd2."seizureWorth"
      )
    )
    FROM "brief_facts_drug" bfd2
    WHERE bfd2."crimeId" = c.id
  ) AS "drugWithQuantity",
  c."caseClassification",
  c."caseStatus",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', cs.id, 'chargeSheetDate', cs."dateCreated"))
    FROM "chargesheets" cs
    WHERE cs."crimeId" = c.id
  ) AS "chargesheets",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', csu.id, 'updateDate', csu."dateCreated"))
    FROM "chargesheet_updates" csu
    WHERE csu."crimeId" = c.id
  ) AS "chargesheetUpdates",
  NULL AS "stipulatedPeriodForCS",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f."filePath"))
    FROM "files" f
    WHERE f."parentId" = c.id AND f."sourceType" = 'crime'
  ) AS "documents",
  c."firCopy",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f."filePath"))
    FROM "files" f
    WHERE f."parentId" = c.id AND f."sourceType" = 'crime' AND f."sourceField" = 'PROPERTY'
  ) AS "propertyDocuments",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'filePath', f."filePath"))
    FROM "files" f
    WHERE f."parentId" = c.id AND f."sourceType" = 'crime' AND f."sourceField" = 'IR'
  ) AS "irDocuments",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', d.id, 'disposalType', d."disposalType"))
    FROM "disposal" d
    WHERE d."crimeId" = c.id
  ) AS "disposalDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', ir.id, 'details', ir."details"))
    FROM "interrogation_reports" ir
    WHERE ir."crimeId" = c.id
  ) AS "irDetails",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('id', fcp.id, 'propertyType', fcp."propertyType"))
    FROM "fsl_case_property" fcp
    WHERE fcp."crimeId" = c.id
  ) AS "casePropertyDetails"
FROM "crimes" c
INNER JOIN "hierarchy" h ON c."psCode" = h."psCode"
LEFT JOIN "brief_facts_drug" bfd ON c.id = bfd."crimeId"
GROUP BY c.id, h."distName", h."psName"
WITH DATA;

CREATE INDEX idx_firs_mv_id ON firs_mv (id);
CREATE INDEX idx_firs_mv_year ON firs_mv (year);
CREATE INDEX idx_firs_mv_unit ON firs_mv (unit);
CREATE INDEX idx_firs_mv_ps ON firs_mv (ps);
CREATE INDEX idx_firs_mv_firNumber ON firs_mv ("firNumber");
CREATE INDEX idx_firs_mv_caseStatus ON firs_mv ("caseStatus");
CREATE INDEX idx_firs_mv_crimeType ON firs_mv ("crimeType");

-- ========================================================================
-- VIEW: advanced_search_accuseds_mv
-- ========================================================================
-- Used in: advancedSearch function with accused/persons filters
-- Joins crime, accused, person, hierarchy, and brief facts data
-- Includes all columns needed for advanced search filtering on accused and person fields

CREATE MATERIALIZED VIEW advanced_search_accuseds_mv AS
SELECT 
  a.id,
  a."code" AS "accusedCode",
  a."type",
  a."seqNum",
  a."isCCL",
  a."beard",
  a."build",
  a."color",
  a."ear",
  a."eyes",
  a."face",
  a."hair",
  a."height",
  a."leucoderma",
  a."mole",
  a."mustache",
  a."nose",
  a."teeth",
  a."type" AS "accusedType",
  COALESCE(bfa."status", 'Unknown') AS "accusedStatus",
  h."psCode",
  c."crimeNum" AS "firNum",
  c."firRegNum",
  c."firType",
  c."sections",
  c."firDate",
  c."caseStatus",
  c."caseClassification" AS "caseClass",
  c."majorHead",
  c."minorHead",
  c."crimeType",
  c."ioName",
  c."ioRank",
  c."briefFacts",
  h."psName",
  h."circleCode",
  h."circleName",
  h."sdpoCode",
  h."sdpoName",
  h."subZoneCode",
  h."subZoneName",
  h."distCode",
  h."distName",
  h."rangeCode",
  h."rangeName",
  h."zoneCode",
  h."zoneName",
  h."adgCode",
  h."adgName",
  p."name",
  p."surname",
  p."alias",
  p."fullName",
  p."relationType",
  p."relativeName",
  p."gender",
  p."isDied",
  p."dateOfBirth",
  p."age",
  p."occupation",
  p."educationQualification",
  p."caste",
  p."subCaste",
  p."religion",
  p."domicile",
  p."nationality",
  p."designation",
  p."placeOfWork",
  p."presentHouseNo",
  p."presentStreetRoadNo",
  p."presentWardColony",
  p."presentLandmarkMilestone",
  p."presentLocalityVillage",
  p."presentAreaMandal",
  p."presentDistrict",
  p."presentStateUt",
  p."presentCountry",
  p."presentResidencyType",
  p."presentPinCode",
  p."presentJurisdictionPs",
  p."permanentHouseNo",
  p."permanentStreetRoadNo",
  p."permanentWardColony",
  p."permanentLandmarkMilestone",
  p."permanentLocalityVillage",
  p."permanentAreaMandal",
  p."permanentDistrict",
  p."permanentStateUt",
  p."permanentCountry",
  p."permanentResidencyType",
  p."permanentPinCode",
  p."permanentJurisdictionPs",
  p."phoneNumber",
  p."countryCode",
  p."emailId",
  p."presentAddress",
  p."permanentAddress",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd."primaryDrugName",
        'quantityKg', bfd."standardizedWeightKg",
        'quantityMl', bfd."standardizedVolumeMl",
        'quantityCount', bfd."standardizedCount",
        'worth', bfd."seizureWorth"
      )
    )
    FROM "brief_facts_drug" bfd
    WHERE bfd."crimeId" = c.id
  ) AS "drugDetails",
  NULL AS "stipulatedPeriodForCS"
FROM "accused" a
INNER JOIN "crimes" c ON a."crimeId" = c.id
INNER JOIN "hierarchy" h ON c."psCode" = h."psCode"
LEFT JOIN "persons" p ON a."personId" = p.id
LEFT JOIN "brief_facts_accused" bfa ON a.id = bfa."accusedId"
WITH DATA;

CREATE INDEX idx_advanced_search_accuseds_mv_id ON advanced_search_accuseds_mv (id);
CREATE INDEX idx_advanced_search_accuseds_mv_firNum ON advanced_search_accuseds_mv ("firNum");
CREATE INDEX idx_advanced_search_accuseds_mv_firDate ON advanced_search_accuseds_mv ("firDate");

-- ========================================================================
-- VIEW: advanced_search_firs_mv
-- ========================================================================
-- Used in: advancedSearch function with crime-only filters
-- Joins crime and hierarchy data only
-- Includes all columns needed for advanced search filtering on crime and hierarchy fields

CREATE MATERIALIZED VIEW advanced_search_firs_mv AS
SELECT 
  c.id,
  h."psCode",
  c."crimeNum" AS "firNum",
  c."firRegNum",
  c."firType",
  c."sections",
  c."firDate",
  c."caseStatus",
  c."caseClassification" AS "caseClass",
  c."majorHead",
  c."minorHead",
  c."crimeType",
  c."ioName",
  c."ioRank",
  c."briefFacts",
  h."psName",
  h."circleCode",
  h."circleName",
  h."sdpoCode",
  h."sdpoName",
  h."subZoneCode",
  h."subZoneName",
  h."distCode",
  h."distName",
  h."rangeCode",
  h."rangeName",
  h."zoneCode",
  h."zoneName",
  h."adgCode",
  h."adgName",
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', bfd."primaryDrugName",
        'quantityKg', bfd."standardizedWeightKg",
        'quantityMl', bfd."standardizedVolumeMl",
        'quantityCount', bfd."standardizedCount",
        'worth', bfd."seizureWorth"
      )
    )
    FROM "brief_facts_drug" bfd
    WHERE bfd."crimeId" = c.id
  ) AS "drugDetails",
  NULL AS "stipulatedPeriodForCS"
FROM "crimes" c
INNER JOIN "hierarchy" h ON c."psCode" = h."psCode"
WITH DATA;

CREATE INDEX idx_advanced_search_firs_mv_id ON advanced_search_firs_mv (id);
CREATE INDEX idx_advanced_search_firs_mv_firNum ON advanced_search_firs_mv ("firNum");
CREATE INDEX idx_advanced_search_firs_mv_firDate ON advanced_search_firs_mv ("firDate");

-- ========================================================================
-- VIEW: criminal_profiles_mv
-- ========================================================================
-- Used in: getCriminalProfile, getCriminalProfiles
-- Aggregates person data with crime and arrest statistics
-- Includes deduplication info, crime history, and drug associations

CREATE MATERIALIZED VIEW criminal_profiles_mv AS
SELECT 
  p.id,
  p."alias",
  p."name",
  p."surname",
  p."fullName",
  p."relationType",
  p."relativeName",
  p."gender",
  p."isDied",
  p."dateOfBirth",
  p."age",
  p."domicile",
  p."occupation",
  p."educationQualification",
  p."caste",
  p."subCaste",
  p."religion",
  p."nationality",
  p."designation",
  p."placeOfWork",
  p."presentHouseNo",
  p."presentStreetRoadNo",
  p."presentWardColony",
  p."presentLandmarkMilestone",
  p."presentLocalityVillage",
  p."presentAreaMandal",
  p."presentDistrict",
  p."presentStateUt",
  p."presentCountry",
  p."presentResidencyType",
  p."presentPinCode",
  p."presentJurisdictionPs",
  p."permanentHouseNo",
  p."permanentStreetRoadNo",
  p."permanentWardColony",
  p."permanentLandmarkMilestone",
  p."permanentLocalityVillage",
  p."permanentAreaMandal",
  p."permanentDistrict",
  p."permanentStateUt",
  p."permanentCountry",
  p."permanentResidencyType",
  p."permanentPinCode",
  p."permanentJurisdictionPs",
  p."phoneNumber",
  p."countryCode",
  p."emailId",
  p."identityDocuments",
  p."documents",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('crimeId', c.id, 'firNumber', c."crimeNum"))
    FROM "accused" a
    INNER JOIN "crimes" c ON a."crimeId" = c.id
    WHERE a."personId" = p.id
  ) AS crimes,
  (SELECT MAX(c.id) FROM "accused" a INNER JOIN "crimes" c ON a."crimeId" = c.id WHERE a."personId" = p.id) AS "latestCrimeId",
  (SELECT MAX(c."crimeNum") FROM "accused" a INNER JOIN "crimes" c ON a."crimeId" = c.id WHERE a."personId" = p.id) AS "latestCrimeNo",
  (SELECT COUNT(DISTINCT c.id) FROM "accused" a INNER JOIN "crimes" c ON a."crimeId" = c.id WHERE a."personId" = p.id)::bigint AS "noOfCrimes",
  (
    SELECT COUNT(*)::bigint
    FROM "accused" a
    LEFT JOIN "brief_facts_accused" bfa ON a.id = bfa."accusedId"
    WHERE a."personId" = p.id AND UPPER(TRIM(COALESCE(bfa."status", 'Unknown'))) = 'ARRESTED'
  ) AS "arrestCount",
  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object('crimeId', c.id, 'firNumber', c."crimeNum"))
    FROM "accused" a
    INNER JOIN "crimes" c ON a."crimeId" = c.id
    WHERE a."personId" = p.id
  ) AS "previouslyInvolvedCases",
  COALESCE(
    ARRAY_AGG(DISTINCT UPPER(TRIM(bfd."primaryDrugName"))) FILTER (WHERE bfd."primaryDrugName" IS NOT NULL AND bfd."primaryDrugName" != 'NO_DRUGS_DETECTED'),
    ARRAY[]::text[]
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
FROM "persons" p
LEFT JOIN "accused" a ON p.id = a."personId"
LEFT JOIN "brief_facts_drug" bfd ON a."crimeId" = bfd."crimeId"
GROUP BY p.id
WITH DATA;

CREATE INDEX idx_criminal_profiles_mv_id ON criminal_profiles_mv (id);
CREATE INDEX idx_criminal_profiles_mv_fullName ON criminal_profiles_mv ("fullName");
CREATE INDEX idx_criminal_profiles_mv_noOfCrimes ON criminal_profiles_mv ("noOfCrimes");

-- ========================================================================
-- REFRESH STRATEGY
-- ========================================================================
-- These materialized views should be refreshed:
-- - After bulk data imports
-- - After crime/accused/person updates
-- - On a scheduled basis (e.g., daily off-peak hours)
--
-- Example refresh commands:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_accuseds_mv;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_firs_mv;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY criminal_profiles_mv;
