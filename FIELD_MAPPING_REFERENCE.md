# Field Mapping Reference: Old Schema → New Schema → GraphQL API

## Quick Reference Table

| GraphQL Field | Old Schema Source | New Schema Source | Transformation | View Column |
|---|---|---|---|---|
| id | accused.accused_id | accused.accused_id | No change | a.accused_id AS id |
| unit | hierarchy.dist_name | hierarchy.dist_name | No change | h.dist_name AS unit |
| ps | hierarchy.ps_name | hierarchy.ps_name | No change | h.ps_name AS ps |
| year | crimes (extract) | crimes (extract) | EXTRACT(YEAR FROM fir_date) | `EXTRACT(YEAR FROM c.fir_date)::int AS year` |
| crimeId | crimes.crime_id | crimes.crime_id | No change | c.crime_id AS "crimeId" |
| personId | persons.person_id | persons.person_id | No change | p.person_id AS "personId" |
| firNumber | crimes.fir_num | crimes.fir_num | No change | c.fir_num AS "firNumber" |
| firRegNum | crimes.fir_reg_num | crimes.fir_reg_num | No change | c.fir_reg_num AS "firRegNum" |
| section | crimes.acts_sections | crimes.acts_sections | No change | c.acts_sections AS section |
| crimeRegDate | crimes.fir_date | crimes.fir_date | No change | c.fir_date AS "crimeRegDate" |
| briefFacts | crimes.brief_facts | crimes.brief_facts | No change | c.brief_facts AS "briefFacts" |
| accusedCode | accused.accused_code | accused.accused_code | No change | a.accused_code AS "accusedCode" |
| seqNum | accused.seq_num | accused.seq_num | No change | a.seq_num AS "seqNum" |
| isCCL | accused.is_ccl | accused.is_ccl | No change | a.is_ccl AS "isCCL" |
| beard | accused.beard | accused.beard | No change | a.beard |
| build | accused.build | accused.build | No change | a.build |
| color | accused.color | accused.color | No change | a.color |
| ear | accused.ear | accused.ear | No change | a.ear |
| eyes | accused.eyes | accused.eyes | No change | a.eyes |
| face | accused.face | accused.face | No change | a.face |
| hair | accused.hair | accused.hair | No change | a.hair |
| height | accused.height | accused.height | No change | a.height |
| leucoderma | accused.leucoderma | accused.leucoderma | No change | a.leucoderma |
| mole | accused.mole | accused.mole | No change | a.mole |
| mustache | accused.mustache | accused.mustache | No change | a.mustache |
| nose | accused.nose | accused.nose | No change | a.nose |
| teeth | accused.teeth | accused.teeth | No change | a.teeth |
| accusedStatus | **[CHANGED]** | accused.accused_status + brief_facts_accused.status | COALESCE(bfa.status, a.accused_status, 'Unknown') | COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus" |
| accusedType | accused.type | accused.type | No change | a.type AS "accusedType" |
| noOfAccusedInvolved | COUNT subquery | COUNT subquery | Subquery unchanged | (SELECT COUNT(*) FROM accused a3 WHERE a3.crime_id = c.crime_id) |
| accusedDetails | JSONB_AGG subquery | JSONB_AGG subquery | Schema changed in subquery | (SELECT jsonb_agg(...)) AS "accusedDetails" |
| fullName | persons.full_name | persons.full_name | No change | p.full_name AS "fullName" |
| parentage | persons.relative_name | persons.relative_name | No change | p.relative_name AS "parentage" |
| relationType | persons.relation_type | persons.relation_type | No change | p.relation_type AS "relationType" |
| gender | persons.gender | persons.gender | No change | p.gender |
| isDied | persons.is_died | persons.is_died | No change | p.is_died AS "isDied" |
| dateOfBirth | persons.date_of_birth | persons.date_of_birth | No change | p.date_of_birth AS "dateOfBirth" |
| age | persons.age | persons.age | No change | p.age |
| domicile | persons.domicile_classification | persons.domicile_classification | No change | p.domicile_classification AS "domicile" |
| occupation | persons.occupation | persons.occupation | No change | p.occupation |
| educationQualification | persons.education_qualification | persons.education_qualification | No change | p.education_qualification AS "educationQualification" |
| caste | persons.caste | persons.caste | No change | p.caste |
| subCaste | persons.sub_caste | persons.sub_caste | No change | p.sub_caste AS "subCaste" |
| religion | persons.religion | persons.religion | No change | p.religion |
| nationality | persons.nationality | persons.nationality | No change | p.nationality |
| designation | persons.designation | persons.designation | No change | p.designation |
| placeOfWork | persons.place_of_work | persons.place_of_work | No change | p.place_of_work AS "placeOfWork" |
| presentHouseNo | persons.present_house_no | persons.present_house_no | No change | p.present_house_no AS "presentHouseNo" |
| presentStreetRoadNo | persons.present_street_road_no | persons.present_street_road_no | No change | p.present_street_road_no AS "presentStreetRoadNo" |
| presentWardColony | persons.present_ward_colony | persons.present_ward_colony | No change | p.present_ward_colony AS "presentWardColony" |
| presentLandmarkMilestone | persons.present_landmark_milestone | persons.present_landmark_milestone | No change | p.present_landmark_milestone AS "presentLandmarkMilestone" |
| presentLocalityVillage | persons.present_locality_village | persons.present_locality_village | No change | p.present_locality_village AS "presentLocalityVillage" |
| presentAreaMandal | persons.present_area_mandal | persons.present_area_mandal | No change | p.present_area_mandal AS "presentAreaMandal" |
| presentDistrict | persons.present_district | persons.present_district | No change | p.present_district AS "presentDistrict" |
| presentStateUt | persons.present_state_ut | persons.present_state_ut | No change | p.present_state_ut AS "presentStateUt" |
| presentCountry | persons.present_country | persons.present_country | No change | p.present_country AS "presentCountry" |
| presentResidencyType | persons.present_residency_type | persons.present_residency_type | No change | p.present_residency_type AS "presentResidencyType" |
| presentPinCode | persons.present_pin_code | persons.present_pin_code | No change | p.present_pin_code AS "presentPinCode" |
| presentJurisdictionPs | persons.present_jurisdiction_ps | persons.present_jurisdiction_ps | No change | p.present_jurisdiction_ps AS "presentJurisdictionPs" |
| presentAddress | Concatenated | Concatenated | CONCAT_WS | CONCAT_WS(', ', ...) AS "presentAddress" |
| permanentHouseNo | persons.permanent_house_no | persons.permanent_house_no | No change | p.permanent_house_no AS "permanentHouseNo" |
| permanentStreetRoadNo | persons.permanent_street_road_no | persons.permanent_street_road_no | No change | p.permanent_street_road_no AS "permanentStreetRoadNo" |
| permanentWardColony | persons.permanent_ward_colony | persons.permanent_ward_colony | No change | p.permanent_ward_colony AS "permanentWardColony" |
| permanentLandmarkMilestone | persons.permanent_landmark_milestone | persons.permanent_landmark_milestone | No change | p.permanent_landmark_milestone AS "permanentLandmarkMilestone" |
| permanentLocalityVillage | persons.permanent_locality_village | persons.permanent_locality_village | No change | p.permanent_locality_village AS "permanentLocalityVillage" |
| permanentAreaMandal | persons.permanent_area_mandal | persons.permanent_area_mandal | No change | p.permanent_area_mandal AS "permanentAreaMandal" |
| permanentDistrict | persons.permanent_district | persons.permanent_district | No change | p.permanent_district AS "permanentDistrict" |
| permanentStateUt | persons.permanent_state_ut | persons.permanent_state_ut | No change | p.permanent_state_ut AS "permanentStateUt" |
| permanentCountry | persons.permanent_country | persons.permanent_country | No change | p.permanent_country AS "permanentCountry" |
| permanentResidencyType | persons.permanent_residency_type | persons.permanent_residency_type | No change | p.permanent_residency_type AS "permanentResidencyType" |
| permanentPinCode | persons.permanent_pin_code | persons.permanent_pin_code | No change | p.permanent_pin_code AS "permanentPinCode" |
| permanentJurisdictionPs | persons.permanent_jurisdiction_ps | persons.permanent_jurisdiction_ps | No change | p.permanent_jurisdiction_ps AS "permanentJurisdictionPs" |
| permanentAddress | Concatenated | Concatenated | CONCAT_WS | CONCAT_WS(', ', ...) AS "permanentAddress" |
| phoneNumber | persons.phone_number | persons.phone_number | No change | p.phone_number AS "phoneNumber" |
| countryCode | persons.country_code | persons.country_code | No change | p.country_code AS "countryCode" |
| emailId | persons.email_id | persons.email_id | No change | p.email_id AS "emailId" |
| noOfCrimes | COUNT subquery | COUNT subquery | No change | (SELECT COUNT(*) FROM accused a3 WHERE a3.person_id = p.person_id) |
| previouslyInvolvedCases | JSONB_AGG subquery | JSONB_AGG subquery | No change | (SELECT jsonb_agg(...)) AS "previouslyInvolvedCases" |
| drugType | ARRAY_AGG subquery | ARRAY_AGG subquery | **[Changed column names]** | (SELECT COALESCE(ARRAY_AGG(...), ARRAY[])) |
| drugWithQuantity | JSONB_AGG subquery | JSONB_AGG subquery | **[MAJOR CHANGE]** | (SELECT jsonb_agg(...)) AS "drugWithQuantity" |
| caseClassification | crimes.class_classification | crimes.class_classification | No change | c.class_classification AS "caseClassification" |
| caseStatus | crimes.case_status | crimes.case_status | No change | c.case_status AS "caseStatus" |

---

## Detailed Field Changes

### CRITICAL CHANGES

#### 1. accusedStatus (Priority Change)
**GraphQL Field**: `accusedStatus`

**Old Schema**:
- Source: `brief_facts_accused.status` OR `accused.type` OR similar
- Single source of truth unclear

**New Schema**:
- Source 1: `brief_facts_accused.status` (highest priority)
- Source 2: `accused.accused_status` (new column, priority 2)
- Source 3: `'Unknown'` (fallback)

**Materialized View Query**:
```sql
COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus"
```

**Impact on Frontend**: NONE - Same API contract, different backend logic

---

#### 2. drugWithQuantity (Schema Restructuring)
**GraphQL Field**: `drugWithQuantity` (array of drug objects)

**Old Schema** (`brief_facts_drug` table):
```
drug_name                VARCHAR(255)
packaging_details        VARCHAR
primary_unit_type        VARCHAR
quantity_numeric         NUMERIC
quantity_unit            VARCHAR
standardized_count       NUMERIC
standardized_quantity_kg NUMERIC
standardized_unit        VARCHAR
standardized_volume_ml   NUMERIC
standardized_weight_kg   NUMERIC
```

**New Schema** (`brief_facts_drug` table):
```
raw_drug_name            TEXT
raw_quantity             NUMERIC
raw_unit                 TEXT
primary_drug_name        TEXT NOT NULL
drug_form                TEXT
weight_g                 NUMERIC
weight_kg                NUMERIC
volume_ml                NUMERIC
volume_l                 NUMERIC
count_total              NUMERIC
confidence_score         NUMERIC(3,2)
seizure_worth            NUMERIC
```

**Old Materialized View Construction**:
```sql
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd.drug_name,
    'quantity', bfd.quantity_numeric,
    'unit', bfd.quantity_unit,
    'worth', bfd.seizure_worth
  )
)
```

**New Materialized View Construction**:
```sql
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd.primary_drug_name,         -- Changed from drug_name
    'quantityKg', bfd.weight_kg,           -- Changed from quantity_numeric/quantity_unit
    'quantityMl', bfd.volume_ml,           -- New field
    'quantityCount', bfd.count_total,      -- Changed from standardized_count
    'worth', bfd.seizure_worth             -- Unchanged
  )
)
```

**Mapping Logic**:
| Old Concept | Old Column | New Column | Notes |
|---|---|---|---|
| Drug name | `drug_name` | `primary_drug_name` | TEXT instead of VARCHAR |
| Quantity (weight) | `standardized_weight_kg` | `weight_kg` | Direct 1:1 mapping |
| Quantity (volume) | `standardized_volume_ml` | `volume_ml` | Direct 1:1 mapping |
| Item count | `standardized_count` | `count_total` | Direct 1:1 mapping |
| Package info | `packaging_details` | **REMOVED** | No equivalent in new schema |
| Raw data | N/A | `raw_quantity`, `raw_unit` | NEW for audit trail |
| Precision | `integer` | `numeric(3,2)` | `confidence_score` only |

**Impact on Frontend**: NONE - GraphQL field names and structure unchanged

---

### Non-Breaking Changes

#### 3. confidence_score (Type Change)
**Column**: `brief_facts_drug.confidence_score`

**Old**: `integer`  
**New**: `numeric(3,2)`

**Reason**: More precise representation of percentages (0.00-1.00 or 0-100)

**Query Impact**: 
```sql
-- Both work the same in SELECT
SELECT confidence_score FROM brief_facts_drug;  -- Works in old and new
```

**Frontend Impact**: NONE

---

#### 4. created_at Timezone Handling
**Column**: `brief_facts_drug.created_at`

**Old**: `timestamp without time zone DEFAULT CURRENT_TIMESTAMP`  
**New**: `timestamp with time zone DEFAULT now()`

**Reason**: Timezone awareness for correctness

**Materialized View Impact**: NO CHANGE - Views don't expose this field

---

### Field Mappings by Table

## ACCUSED Table Mappings

| GraphQL Field | SQL Alias | Source | Notes |
|---|---|---|---|
| id | - | `accused.accused_id` | Primary identifier |
| accusedCode | "accusedCode" | `accused.accused_code` | Code identifier |
| seqNum | "seqNum" | `accused.seq_num` | Sequence number |
| isCCL | "isCCL" | `accused.is_ccl` | Child in conflict with law |
| type | "accusedType" | `accused.type` | Type of accused |
| beard | - | `accused.beard` | Physical feature |
| build | - | `accused.build` | Physical feature |
| color | - | `accused.color` | Physical feature |
| ear | - | `accused.ear` | Physical feature |
| eyes | - | `accused.eyes` | Physical feature |
| face | - | `accused.face` | Physical feature |
| hair | - | `accused.hair` | Physical feature |
| height | - | `accused.height` | Physical feature |
| leucoderma | - | `accused.leucoderma` | Physical feature |
| mole | - | `accused.mole` | Physical feature |
| mustache | - | `accused.mustache` | Physical feature |
| nose | - | `accused.nose` | Physical feature |
| teeth | - | `accused.teeth` | Physical feature |
| accusedStatus | "accusedStatus" | COALESCE(bfa.status, a.accused_status) | **PRIORITY CHANGED** |

---

## CRIMES Table Mappings

| GraphQL Field | SQL Alias | Source | Notes |
|---|---|---|---|
| crimeId | "crimeId" | `crimes.crime_id` | Primary identifier |
| firNumber | "firNumber" | `crimes.fir_num` | FIR number |
| firRegNum | "firRegNum" | `crimes.fir_reg_num` | FIR registration number |
| section | section | `crimes.acts_sections` | Acts and sections |
| crimeRegDate | "crimeRegDate" | `crimes.fir_date` | FIR date |
| briefFacts | "briefFacts" | `crimes.brief_facts` | Crime details |
| caseClassification | "caseClassification" | `crimes.class_classification` | Case class |
| caseStatus | "caseStatus" | `crimes.case_status` | Case status |

**New Columns Not Exposed**:
- `additional_json_data` - For future extensibility

---

## PERSONS Table Mappings

All person fields maintain identical mappings:

| Pattern | Example Old | Example New | Alias Pattern |
|---|---|---|---|
| snake_case → camelCase | `full_name` | `full_name` | `"fullName"` |
| snake_case → camelCase | `date_of_birth` | `date_of_birth` | `"dateOfBirth"` |
| No changes to columns | All 40+ columns unchanged | All 40+ columns unchanged | Consistent pattern |

---

## BRIEF_FACTS_ACCUSED Table Mappings

| GraphQL Field | Used In | Mapping |
|---|---|---|
| accusedStatus | accusedStatus (in COALESCE) | `bfa.status` (first priority) |
| (nested in accusedDetails) | accusedDetails JSONB | All fields extracted to object |

**Fields Included in accusedDetails JSONB**:
```json
{
  "name": "p2.name",
  "surname": "p2.surname",
  "alias": "p2.alias",
  "fullName": "p2.full_name",
  "status": "COALESCE(bfa2.status, a2.accused_status, 'Unknown')",
  "email": "p2.email_id"
}
```

---

## BRIEF_FACTS_DRUG Table Mappings

**Included in drugWithQuantity JSONB**:
```json
{
  "name": "bfd.primary_drug_name",
  "quantityKg": "bfd.weight_kg",
  "quantityMl": "bfd.volume_ml",
  "quantityCount": "bfd.count_total",
  "worth": "bfd.seizure_worth"
}
```

**New Columns Not Exposed**:
- `raw_drug_name` - Source data
- `raw_quantity` - Source data
- `raw_unit` - Source data
- `drug_form` - Reference data
- `weight_g` - Alternative unit
- `volume_l` - Alternative unit
- `confidence_score` - Precision metadata
- `accused_id` - Foreign key
- `updated_at` - Audit field

---

## HIERARCHY Table Mappings

| GraphQL Field | SQL Alias | Source | Notes |
|---|---|---|---|
| unit | - | `hierarchy.dist_name` | District name |
| ps | - | `hierarchy.ps_name` | Police station name |

**Other hierarchy fields** (used in FIR queries):
- circle_code, circle_name
- sdpo_code, sdpo_name
- sub_zone_code, sub_zone_name
- dist_code, dist_name
- range_code, range_name
- zone_code, zone_name
- adg_code, adg_name

---

## Derived/Computed Fields

| GraphQL Field | Computation | Source Tables |
|---|---|---|
| year | `EXTRACT(YEAR FROM c.fir_date)::int` | crimes.fir_date |
| noOfAccusedInvolved | `COUNT(*) FROM accused` | accused |
| noOfCrimes | `COUNT(*) FROM accused` | accused (WHERE person_id = p.person_id) |
| presentAddress | `CONCAT_WS(', ', ...)` | persons (6 address fields) |
| permanentAddress | `CONCAT_WS(', ', ...)` | persons (6 address fields) |
| accusedDetails | `jsonb_agg(jsonb_build_object(...))` | accused + persons + brief_facts_accused |
| previouslyInvolvedCases | `jsonb_agg(jsonb_build_object(...))` | accused + crimes |
| drugType | `ARRAY_AGG(DISTINCT ...)` | brief_facts_drug |
| drugWithQuantity | `jsonb_agg(jsonb_build_object(...))` | brief_facts_drug |

---

## Usage Examples

### Example 1: Retrieve Full Accused Record
```sql
SELECT * FROM accuseds_mv WHERE id = 'ACC12345';
```

**Result Structure**:
```json
{
  "id": "ACC12345",
  "crimeId": "CRIME001",
  "accusedCode": "AC001",
  "accusedStatus": "Arrested",  // From new a.accused_status or bfa.status
  "accusedType": "Suspect",
  "fullName": "John Doe",
  "gender": "Male",
  "age": 35,
  "phoneNumber": "+91 1234567890",
  "drugWithQuantity": [
    {
      "name": "Heroin",
      "quantityKg": 2.5,
      "quantityMl": null,
      "quantityCount": 10,
      "worth": 250000
    }
  ],
  "caseStatus": "Active",
  "previouslyInvolvedCases": [
    { "crimeId": "CRIME002", "firNumber": "2022/001" },
    { "crimeId": "CRIME003", "firNumber": "2023/045" }
  ]
}
```

---

### Example 2: Filter by Status
```sql
SELECT id, fullName, accusedStatus, caseStatus 
FROM accuseds_mv 
WHERE accusedStatus IN ('Arrested', 'Absconding')
LIMIT 10;
```

---

### Example 3: Get Drugs for Crime
```sql
SELECT 
  jsonb_array_elements("drugWithQuantity")->>'name' as drug_name,
  (jsonb_array_elements("drugWithQuantity")->>'quantityKg')::numeric as weight_kg
FROM firs_mv 
WHERE id = 'CRIME001';
```

---

## Summary

| Aspect | Status | Impact |
|---|---|---|
| Column renames | ✅ Handled via aliases in views | No frontend changes needed |
| Table schema changes | ✅ Handled via transformations in views | No frontend changes needed |
| Status resolution | ✅ New COALESCE priority in views | Same API output |
| Drug measurements | ✅ New column mapping in JSONB objects | Same API structure |
| Person details | ✅ Unchanged | No changes |
| Hierarchy mapping | ✅ Unchanged | No changes |
| **Frontend API Contract** | ✅ **FULLY PRESERVED** | **No code changes needed** |

