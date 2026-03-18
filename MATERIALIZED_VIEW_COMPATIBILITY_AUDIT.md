# Materialized View Compatibility Audit Report

**Audit Date**: 2026-03-13  
**Backend Version**: Current (analyzed from source code)  
**Reconstruction SQL Version**: User-provided reconstruction

---

## Executive Summary

⚠️ **CRITICAL ISSUES FOUND**: The reconstructed materialized views have **significant compatibility issues** that will cause backend queries to fail. 

- **accuseds_mv**: ❌ **BROKEN** - Multiple column name mismatches
- **firs_mv**: ❌ **BROKEN** - Missing/renamed columns in drug aggregation
- **advanced_search_accuseds_mv**: ⚠️ **PARTIAL** - Inherits issues from base tables
- **advanced_search_firs_mv**: ⚠️ **PARTIAL** - Inherits issues from base tables
- **criminal_profiles_mv**: ⚠️ **PARTIAL** - Missing `crimes` JSONB field

---

## STEP 1: View Usage Summary

### accuseds_mv
**Used in**: 19+ locations
- `src/schema/accused/services/index.ts` - getAccused, getAccuseds, getAccusedStatistics, getAccusedFilterValues, getAccusedAbstract
- `src/schema/home/services/index.ts` - getAccusedTypeClassification, getOverallCrimeStats

**Primary operations**:
- `SELECT * FROM accuseds_mv WHERE id = $1`
- `SELECT * FROM accuseds_mv` (with various filters)
- `SELECT DISTINCT field FROM accuseds_mv` (for filter value lookups)
- CROSS JOIN LATERAL unnest for `drugType` array

### firs_mv
**Used in**: 25+ locations
- `src/schema/firs/services/index.ts` - getFir, getFirs, getFirStatistics, getFirFilterValues, getFirsAbstract, getUiPtCasesStatistics
- `src/schema/firs/services/seizures.ts` - getSeizuresFilterValues, getSeizuresStatistics, getSeizuresAbstract
- `src/schema/home/services/index.ts` - Multiple classification and statistics functions

**Primary operations**:
- `SELECT * FROM firs_mv`
- `INNER JOIN firs_mv ON fmv.id = bfd.crime_id` (with brief_facts_drug)
- `SELECT DISTINCT` for filter values

### advanced_search_accuseds_mv & advanced_search_firs_mv
**Used in**: `src/schema/advanced-search/services/index.ts`
- `advancedSearch()` function with dynamic field selection
- `fieldAutocomplete()` function with UNION ALL queries

### criminal_profiles_mv
**Used in**: 
- `src/schema/criminal-profile/services/index.ts`
- `src/schema/home/services/index.ts` - getDomicileClassification

**Primary operations**:
- `SELECT * FROM criminal_profiles_mv WHERE id = $1`
- `CROSS JOIN LATERAL jsonb_array_elements(cp.crimes)` (line 555 in home service)

---

## STEP 2: Backend Expected Columns

### accuseds_mv - Expected Columns

**From SELECT *** (line 215, 235):
- All columns are selected, so ALL must be present

**From WHERE clauses**:
- `id`, `crimeId`, `name`, `fullName`, `surname`, `alias`, `emailId`
- `accusedStatus`, `accusedType`, `caseStatus`, `caseClassification`
- `gender`, `nationality`, `presentStateUt`, `unit`, `ps`
- `domicile`, `age`, `year`
- `drugType` (array that gets unnested)

**From GROUP BY**:
- `caseClassification`, `caseStatus`, `accusedStatus`, `accusedType`
- `domicile`, `ps`, `gender`, `year`, `presentStateUt`, `nationality`, `unit`

**From ORDER BY**:
- `crimeRegDate`, `caseClassification`, `caseStatus`, `accusedStatus`, etc.

### firs_mv - Expected Columns

**From SELECT *** (line 262, 282):
- All columns are selected

**From WHERE clauses**:
- `id`, `caseClassification`, `caseStatus`, `stipulatedPeriodForCS`
- `crimeRegDate` (for date filtering)
- `crimeType`, `unit`, `ps`, `year`

**From GROUP BY**:
- `unit`, `ps`, `year`, `caseStatus`, `caseClassification`, `crimeType`

**From DISTINCT SELECT**:
- `caseClassification`, `caseStatus`, `ps`, `year`, `unit`, `drugType`

**From JOIN with brief_facts_drug**:
- Must have: `id` (to join on crime_id)

### criminal_profiles_mv - Expected Columns

**From code (lines 539, 554-555)**:
- `id`, `domicile`
- **CRITICAL**: `crimes` (JSONB field that contains crime objects, used with `CROSS JOIN LATERAL jsonb_array_elements`)

---

## STEP 3: Critical Issues Found

### ❌ ISSUE 1: BriefFactsDrug Column Mismatches

**Problem**: The reconstruction SQL references columns that don't exist or have different names in the schema.

**Reconstruction SQL uses**:
```sql
bfd.primary_drug_name
bfd.weight_kg
bfd.volume_ml
bfd.volume_l
bfd.count_total
```

**Actual schema columns** (brief_facts_drug table):
```sql
drug_name          -- NOT primary_drug_name
standardized_weight_kg
standardized_volume_ml
-- NO volume_l column
standardized_count -- NOT count_total
```

**Impact**: ✗ **CRITICAL** - All drug aggregation queries will fail

**Affected views**:
- accuseds_mv (drugType, drugWithQuantity aggregations)
- firs_mv (drugType, drugWithQuantity aggregations)
- advanced_search_accuseds_mv (drugDetails aggregation)
- advanced_search_firs_mv (drugDetails aggregation)

**Evidence from backend**:
- Line 505-506 in accused service: `SELECT DISTINCT ON (LOWER(val)) val AS "drugType" FROM accuseds_mv a CROSS JOIN LATERAL unnest(a."drugType")`
- Backend queries in seizures.ts at lines 26-35 reference `primary_drug_name` in direct DB queries

---

### ❌ ISSUE 2: Accused Status Field Doesn't Exist in Base Table

**Problem**: The reconstruction SQL uses `a.accused_status` and `COALESCE(bfa.status, a.accused_status, 'Unknown')`, but the Accused table has NO `accused_status` field.

**Reconstruction attempt**:
```sql
COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus"
```

**Reality**:
- Accused table has NO `accused_status` field
- Only BriefFactsAccused has a `status` field (maps to `status` in DB)
- When LEFT JOIN BriefFactsAccused is NULL, there's no fallback value

**Impact**: ✗ **CRITICAL** - accusedStatus will always be NULL or default to 'Unknown' when bfa.status is NULL

**Expected behavior from backend**: 
- Backend queries expect `accusedStatus` to contain valid values like 'Arrested', 'Absconding', etc.
- Line 470 in accused service: `SELECT DISTINCT a."accusedStatus" from accuseds_mv`

**Fix needed**:
```sql
COALESCE(bfa.status, 'Unknown') AS "accusedStatus"
```

---

### ❌ ISSUE 3: Missing `crimes` JSONB Field in criminal_profiles_mv

**Problem**: The backend queries use `CROSS JOIN LATERAL jsonb_array_elements(cp.crimes)` (line 555 in home service), but the reconstruction SQL does NOT include this field.

**Reconstruction view includes**:
```sql
(jsonb_agg(...) ...) AS "previouslyInvolvedCases"
```

**Backend expects** (line 555):
```sql
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cp.crimes, '[]'::jsonb)) AS crime
```

**Impact**: ⚠️ **PARTIAL** - getDomicileClassification() will fail when filtering by crime date

**Missing field**: 
```sql
-- Need to add:
(
  SELECT jsonb_agg(jsonb_build_object(...))
  FROM crimes c ...
  WHERE ... 
) AS "crimes"
```

---

### ⚠️ ISSUE 4: Incorrect Table/Column Aliasing

**Problem**: The reconstruction SQL joins the Accused table but some columns are expected to come from different sources.

**In accuseds_mv**:
- Line 33: `COALESCE(bfa.status, a.accused_status, 'Unknown')` - `a.accused_status` doesn't exist
- Line 43: Same issue in subquery
- Line 52: `p.relative_name AS "parentage"` - Backend queries use this as `parentage` ✓ (correct)

---

### ⚠️ ISSUE 5: Person State Field Case Mismatch

**Schema definition** (line 148, 160):
```prisma
presentStateUT    String?   @map("present_state_ut")
permanentStateUT  String?   @map("permanent_state_ut")
```

**Reconstruction SQL**:
```sql
p.present_state_ut AS "presentStateUt"
p.permanent_state_ut AS "permanentStateUt"
```

**Backend queries** (line 494 in accused service):
```sql
SELECT DISTINCT a."presentStateUt" from accuseds_mv
```

**Issue**: The column alias in the view is `presentStateUt` (correct), but this only works if the view definition is correct. Since the view is built from person fields, this should work... **HOWEVER**, there's an inconsistency in the Prisma schema itself where the field name is `presentStateUT` (with capital T) but the backend might expect `presentStateUt`.

---

## STEP 4: Detailed Compatibility Report

### VIEW: accuseds_mv

**Status**: ❌ **BROKEN**

#### Backend Expects Columns:
```
id, unit, ps, year, crimeId, personId, firNumber, firRegNum, section, 
crimeRegDate, briefFacts, accusedCode, seqNum, isCCL, beard, build, 
color, ear, eyes, face, hair, height, leucoderma, mole, mustache, nose, teeth,
accusedStatus, accusedType, noOfAccusedInvolved, accusedDetails,
name, surname, alias, fullName, parentage, domicile, relationType, gender, isDied,
dateOfBirth, age, occupation, educationQualification, caste, subCaste, religion,
nationality, designation, placeOfWork, presentHouseNo, presentStreetRoadNo,
presentWardColony, presentLandmarkMilestone, presentLocalityVillage, presentAreaMandal,
presentDistrict, presentStateUt, presentCountry, presentResidencyType, presentPinCode,
presentJurisdictionPs, permanentHouseNo, permanentStreetRoadNo, permanentWardColony,
permanentLandmarkMilestone, permanentLocalityVillage, permanentAreaMandal, permanentDistrict,
permanentStateUt, permanentCountry, permanentResidencyType, permanentPinCode,
permanentJurisdictionPs, phoneNumber, countryCode, emailId, presentAddress,
permanentAddress, noOfCrimes, previouslyInvolvedCases, drugType, drugWithQuantity,
caseClassification, caseStatus
```

#### Columns Present in Reconstruction:
✓ All columns listed above

#### Issues:
1. ❌ `drugType` aggregation uses wrong column name (`primary_drug_name` → doesn't exist, should use `drug_name`)
2. ❌ `drugWithQuantity` uses wrong column names:
   - `bfd.weight_kg` → should be `bfd.standardized_weight_kg`
   - `bfd.volume_ml` → should be `bfd.standardized_volume_ml`
   - `bfd.volume_l` → doesn't exist in schema
   - `bfd.count_total` → should be `bfd.standardized_count`
3. ❌ `accusedStatus` logic is flawed - `a.accused_status` doesn't exist
4. ⚠️ `presentStateUt`/`permanentStateUt` field case inconsistency with Prisma schema

#### Fix Suggestions:
```sql
-- Replace drug aggregation:
SELECT COALESCE(
  ARRAY_AGG(DISTINCT UPPER(TRIM(bfd.drug_name))) 
  FILTER (WHERE bfd.drug_name IS NOT NULL AND bfd.drug_name != 'NO_DRUGS_DETECTED'),
  ARRAY[]::text[]
)
FROM brief_facts_drug bfd 
WHERE bfd.crime_id = c.crime_id

-- Replace drugWithQuantity:
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd2.drug_name,
    'quantityKg', bfd2.standardized_weight_kg,
    'quantityMl', bfd2.standardized_volume_ml,
    'quantityCount', bfd2.standardized_count,
    'worth', bfd2.seizure_worth
  )
)
FROM brief_facts_drug bfd2
WHERE bfd2.crime_id = c.crime_id

-- Fix accusedStatus (remove reference to non-existent a.accused_status):
COALESCE(bfa.status, 'Unknown') AS "accusedStatus"
```

#### Performance Indexes:
✓ Recommended indexes are present (id, crimeId, year, unit, ps)

---

### VIEW: firs_mv

**Status**: ❌ **BROKEN**

#### Backend Expects Columns:
```
id, unit, ps, year, firNumber, firRegNum, section, firType, crimeType,
crimeRegDate, majorHead, minorHead, ioName, ioRank, briefFacts,
noOfAccusedInvolved, accusedDetails, propertyDetails, moSeizuresDetails,
drugType, drugWithQuantity, caseClassification, caseStatus,
chargesheets, chargesheetUpdates, stipulatedPeriodForCS,
documents, firCopy, propertyDocuments, irDocuments,
disposalDetails, irDetails, casePropertyDetails
```

#### Columns Present in Reconstruction:
✓ All columns listed above

#### Issues:
1. ❌ `drugType` uses wrong column name (`primary_drug_name` → doesn't exist, should be `drug_name`)
2. ❌ `drugWithQuantity` uses wrong column names (same as accuseds_mv):
   - `bfd2.weight_kg` → `bfd2.standardized_weight_kg`
   - `bfd2.volume_ml` → `bfd2.standardized_volume_ml`
   - `bfd2.volume_l` → doesn't exist
   - `bfd2.count_total` → `bfd2.standardized_count`
3. ❌ Missing Arrested/Absconding status field in the view (though may not be directly used in SELECT *)

#### Fix Suggestions:
Same as accuseds_mv for drug aggregations

#### Performance Indexes:
✓ Recommended indexes are present (id, year, unit, ps, firNumber, caseStatus, crimeType)

---

### VIEW: advanced_search_accuseds_mv

**Status**: ⚠️ **PARTIAL** (Inherits drug-related issues)

#### Issues:
1. ❌ `drugDetails` aggregation uses wrong column names (same drug column issues)
2. ✓ All other columns should be present
3. ✓ Field mapping appears correct for crime/person/hierarchy fields

#### Fix:
Replace `drugDetails` aggregation with correct column names

---

### VIEW: advanced_search_firs_mv

**Status**: ⚠️ **PARTIAL** (Inherits drug-related issues)

#### Issues:
1. ❌ `drugDetails` aggregation uses wrong column names

#### Fix:
Replace `drugDetails` aggregation with correct column names

---

### VIEW: criminal_profiles_mv

**Status**: ⚠️ **PARTIAL** (Missing critical JSONB field)

#### Backend Expects:
```sql
id, alias, name, surname, fullName, relationType, relativeName, gender,
isDied, dateOfBirth, age, domicile, occupation, educationQualification,
caste, subCaste, religion, nationality, designation, placeOfWork,
presentHouseNo, presentStreetRoadNo, presentWardColony, presentLandmarkMilestone,
presentLocalityVillage, presentAreaMandal, presentDistrict, presentStateUt,
presentCountry, presentResidencyType, presentPinCode, presentJurisdictionPs,
permanentHouseNo, permanentStreetRoadNo, permanentWardColony, permanentLandmarkMilestone,
permanentLocalityVillage, permanentAreaMandal, permanentDistrict, permanentStateUt,
permanentCountry, permanentResidencyType, permanentPinCode, permanentJurisdictionPs,
phoneNumber, countryCode, emailId, identityDocuments, documents,
crimes, latestCrimeId, latestCrimeNo, noOfCrimes, arrestCount,
previouslyInvolvedCases, associatedDrugs, DOPAMSLinks, counselled,
socialMedia, RTAData, bankAcountDetails, passportDetails_Foreigners,
purposeOfVISA_Foreigners, validityOfVISA_Foreigners, localaddress_Foreigners,
nativeAddress_Foreigners, statusOfTheAccused, historySheet, propertyForfeited,
PITNDPSInitiated
```

#### Critical Missing Field:
❌ **`crimes`** (JSONB field)

**Backend usage** (line 555 in home/services/index.ts):
```sql
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cp.crimes, '[]'::jsonb)) AS crime
WHERE crime->>'crimeRegDate' IS NOT NULL
```

This query **will FAIL** because the `crimes` field is not present in the view.

#### Fix:
Add the crimes field aggregation:
```sql
(
  SELECT jsonb_agg(jsonb_build_object(
    'id', c.crime_id,
    'firNumber', c.fir_num,
    'crimeRegDate', c.fir_date
  ))
  FROM accused a2
  INNER JOIN crimes c ON a2.crime_id = c.crime_id
  WHERE a2.person_id = p.person_id
) AS crimes
```

---

## STEP 5: Performance Audit

### Missing Indexes:
- ✓ accuseds_mv: All recommended indexes present
- ✓ firs_mv: All recommended indexes present
- ✓ advanced_search views: Indexes on id, firNum, firDate present
- ✓ criminal_profiles_mv: Indexes on id, fullName, noOfCrimes present

### Frequently Filtered Columns (from code analysis):
- accusedStatus, caseStatus, caseClassification - **INDEXED** ✓
- drugType - **NOT INDEXED** (but it's an array, so indexing would use GIN)
- crimeRegDate - **INDEXED** ✓
- year - **INDEXED** ✓

---

## Summary of Required Fixes

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| Wrong drug column names (primary_drug_name) | CRITICAL | All views with drug data | Use `drug_name` instead |
| Wrong quantity column names (weight_kg, volume_ml, etc.) | CRITICAL | All views with drug data | Use `standardized_weight_kg`, `standardized_volume_ml`, `standardized_count` |
| Non-existent a.accused_status reference | CRITICAL | accuseds_mv | Remove `a.accused_status`, use only `bfa.status` |
| Missing `crimes` JSONB field | CRITICAL | criminal_profiles_mv | Add crimes aggregation |
| volume_l column doesn't exist | CRITICAL | All views with drug data | Remove or replace with correct field |

---

## Compatibility Verdict

### Backend Will Break: ✗ YES

**Reason**: Multiple critical column name mismatches in drug aggregations will cause SQL errors when views are queried. The missing `accused_status` field will cause NULL values where data is expected. The missing `crimes` JSONB field will cause queries in home service to fail.

### Required Before Deployment: ✗ DO NOT USE AS-IS

The reconstruction SQL must be corrected with the fixes outlined above before it can be safely deployed.

---

## Recommended Next Steps

1. **Update brief_facts_drug column references**:
   - Replace all `primary_drug_name` with `drug_name`
   - Replace all `weight_kg` with `standardized_weight_kg`
   - Replace all `volume_ml` with `standardized_volume_ml`
   - Replace all `count_total` with `standardized_count`
   - Remove `volume_l` references

2. **Fix accused_status in accuseds_mv**:
   - Change: `COALESCE(bfa.status, a.accused_status, 'Unknown')`
   - To: `COALESCE(bfa.status, 'Unknown')`

3. **Add crimes JSONB field to criminal_profiles_mv**:
   - Include aggregation of crime records with necessary fields

4. **Verify all references match Prisma schema**:
   - Check `@map()` values for correct DB column names
   - Verify field naming conventions (snake_case for DB, camelCase for Prisma)

5. **Test with actual backend queries**:
   - Run getAccused, getFir, getCriminalProfile functions
   - Test filter value lookups
   - Test seizure and statistics aggregations
