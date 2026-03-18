# Schema Migration Analysis & Frontend Compatibility Layer

## Executive Summary

The database schema has been refactored and normalized. To maintain **100% frontend compatibility**, the backend uses **materialized views as a compatibility layer**. This document details the schema changes and how the transformation is accomplished.

---

## Part 1: Schema Changes Overview

### Tables Removed (2)
- `brief_facts_drugs` → Merged into `brief_facts_drug` with restructured columns
- `dedup_comparison_progress_backup` → Removed backup table

### Tables Added (6)
- `drug_categories` - Reference table for drug categorization
- `drug_ignore_list` - Ignore list for drug filtering
- `geo_countries` - Geographic reference data
- `geo_reference` - Geographic reference mapping
- `ir_pending_fk` - Pending foreign keys for interrogation reports
- `properties_pending_fk` - Pending foreign keys for properties

### Tables Modified (Structure Changed)

#### 1. **accused** table
- **NEW COLUMN**: `accused_status` (text)
  - This field now holds status information previously stored elsewhere
  - Materialized view: Maps `COALESCE(bfa.status, a.accused_status, 'Unknown')` to `accusedStatus`

#### 2. **brief_facts_drug** table
- **MAJOR RESTRUCTURING**: Columns completely reorganized
- **Removed Columns** (10):
  - `drug_name`
  - `packaging_details`
  - `primary_unit_type`
  - `quantity_numeric`
  - `quantity_unit`
  - `standardized_count`
  - `standardized_quantity_kg`
  - `standardized_unit`
  - `standardized_volume_ml`
  - `standardized_weight_kg`

- **Added Columns** (10):
  - `accused_id` - Link to accused person
  - `raw_drug_name` - Raw drug name (text)
  - `raw_quantity` - Raw quantity value
  - `raw_unit` - Raw unit text
  - `weight_g` - Weight in grams
  - `weight_kg` - Weight in kilograms
  - `volume_ml` - Volume in milliliters
  - `volume_l` - Volume in liters
  - `count_total` - Total count
  - `updated_at` - Timestamp with timezone

- **Modified Columns** (5):
  - `confidence_score`: `integer` → `numeric(3,2)` (precision change)
  - `created_at`: `timestamp without time zone` → `timestamp with time zone`
  - `crime_id`: `character varying` → `character varying(50) NOT NULL`
  - `drug_form`: `character varying(50)` → `text`
  - `primary_drug_name`: `character varying(255)` → `text NOT NULL`

- **Mapping in Materialized Views**:
```sql
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd.primary_drug_name,
    'quantityKg', bfd.weight_kg,
    'quantityMl', bfd.volume_ml,
    'quantityCount', bfd.count_total,
    'worth', bfd.seizure_worth
  )
) AS "drugWithQuantity"
```

#### 3. **crimes** table
- **NEW COLUMN**: `additional_json_data` (jsonb)
  - For storing extra metadata/extensibility
  - Frontend doesn't use this field directly

#### 4. **brief_facts_accused** table
- **Modified Column**:
  - `status`: `character varying(40)` → `text`
  - Frontend still receives: `COALESCE(bfa.status, a.accused_status, 'Unknown')`

---

## Part 2: Frontend API Response Mapping

### How Frontend Gets Data (Remains Unchanged)

The frontend calls GraphQL queries and expects these resolved values (from the backend schema):

**Example: AccusedType fields**
```typescript
{
  id,                              // FROM: a.accused_id
  unit,                            // FROM: h.dist_name
  ps,                              // FROM: h.ps_name
  year,                            // FROM: EXTRACT(YEAR FROM c.fir_date)
  crimeId,                         // FROM: c.crime_id
  firNumber,                       // FROM: c.fir_num
  firRegNum,                       // FROM: c.fir_reg_num
  section,                         // FROM: c.acts_sections
  crimeRegDate,                    // FROM: c.fir_date
  briefFacts,                      // FROM: c.brief_facts
  accusedCode,                     // FROM: a.accused_code
  seqNum,                          // FROM: a.seq_num
  isCCL,                           // FROM: a.is_ccl
  
  // Physical features
  beard, build, color, ear, eyes, face, hair, height,
  leucoderma, mole, mustache, nose, teeth,
  
  // Status (MODIFIED - now uses new column)
  accusedStatus,                   // FROM: COALESCE(bfa.status, a.accused_status, 'Unknown')
  
  accusedType,                     // FROM: a.type
  noOfAccusedInvolved,            // COUNT from accused table
  accusedDetails,                  // JSONB_AGG from accused table
  
  // Person details (LEFT JOIN)
  personId,                        // FROM: p.person_id
  fullName,                        // FROM: p.full_name
  parentage,                       // FROM: p.relative_name
  gender,                          // FROM: p.gender
  age,                             // FROM: p.age
  
  // Plus 40+ more person columns...
  
  // Drug details (RESTRUCTURED but same output)
  drugType,                        // ARRAY_AGG of drug names
  drugWithQuantity,                // JSONB_AGG of drug objects
  
  caseClassification,              // FROM: c.class_classification
  caseStatus                       // FROM: c.case_status
}
```

---

## Part 3: Critical Materialized Views

The compatibility layer is implemented via **4 materialized views**:

### 1. `accuseds_mv` (Primary View for Accused Queries)
**Purpose**: Returns accused persons with all their crime details and drug information

**Key Transformations**:
- Joins: `accused → crimes → hierarchy → persons → brief_facts_accused → brief_facts_drug`
- Builds JSONB objects for nested data:
  - `accusedDetails` - All accused involved in crime
  - `previouslyInvolvedCases` - Crime history for person
  - `drugWithQuantity` - Drug seizure details
- **Field Priority for Status**: `COALESCE(bfa.status, a.accused_status, 'Unknown')`

**Location**: Lines 8-95 of MVs_newdb.sql

### 2. `firs_mv` (Primary View for FIR/Crime Queries)
**Purpose**: Returns FIR records with all related details (accused, property, seizures, etc.)

**Key Transformations**:
- Joins: `crimes → hierarchy → (accused, properties, mo_seizures, chargesheets, disposal, etc.)`
- Builds JSONB for:
  - `accusedDetails` - Accused involved
  - `propertyDetails` - Property seized
  - `moSeizuresDetails` - MO seizures
  - `drugWithQuantity` - Drug details
  - `chargesheets` - Chargesheet records
  - `documents` - FIR files
  - `disposalDetails` - Case disposal info

**Location**: Lines 106-218 of MVs_newdb.sql

### 3. `advanced_search_accuseds_mv`
**Purpose**: Denormalized view optimized for advanced search filters on accused

**Location**: Lines 231-300 of MVs_newdb.sql

### 4. `advanced_search_firs_mv`
**Purpose**: Denormalized view optimized for advanced search filters on FIR

**Location**: Lines 309+ of MVs_newdb.sql

---

## Part 4: Data Mapping Reference

### Accused Status Resolution
```sql
-- The frontend expects a single status field from multiple possible sources:
COALESCE(
  bfa.status,                    -- From brief_facts_accused (priority 1)
  a.accused_status,              -- From new accused.accused_status column (priority 2)
  'Unknown'                       -- Default fallback
) AS "accusedStatus"
```

### Drug Information Restructuring
**Old Schema Pattern**:
- Single row per drug with all measurements in separate columns
- `standardized_quantity_kg`, `standardized_volume_ml`, etc.

**New Schema Pattern**:
- Separate columns for raw and standardized measurements
- `raw_quantity`, `raw_unit`, `weight_g`, `weight_kg`, `volume_ml`, `volume_l`, `count_total`
- More flexible unit handling
- Direct mapping: Raw fields used as-is, standardized fields calculated

**Materialized View Transformation**:
```sql
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd.primary_drug_name,        -- Drug name
    'quantityKg', bfd.weight_kg,          -- Weight in KG
    'quantityMl', bfd.volume_ml,          -- Volume in ML
    'quantityCount', bfd.count_total,     -- Item count
    'worth', bfd.seizure_worth            -- Seizure value
  )
) AS "drugWithQuantity"
FROM brief_facts_drug bfd
WHERE bfd.crime_id = c.crime_id
```

### Person Details Mapping
All person columns are directly selected with camelCase aliases:

```sql
p.name, p.surname, p.alias, 
p.full_name AS "fullName",
p.relative_name AS "parentage",
p.domicile_classification AS "domicile",
p.relation_type AS "relationType",
p.gender, p.is_died AS "isDied",
p.date_of_birth AS "dateOfBirth", p.age,
p.occupation, p.education_qualification AS "educationQualification",
-- ... plus 40+ more columns with similar pattern
```

---

## Part 5: Backend Service Layer Architecture

**Service File**: `src/schema/accused/services/index.ts`

**Current Implementation**:
1. **Direct MV Queries**: Services execute raw SQL against materialized views
   ```typescript
   const result = await prisma.$queryRawUnsafe<Accuseds[]>(
     `SELECT * FROM accuseds_mv WHERE id = $1 LIMIT 1;`,
     id
   );
   ```

2. **Dynamic Filtering**: Builds WHERE clauses based on filter input
   - Name search across multiple fields
   - Array-like filters (units, gender, nationality, etc.)
   - Age range filters
   - Date range filters
   - Year filters

3. **Pagination**: Manual pagination with OFFSET/LIMIT
   ```typescript
   LIMIT ${limit} OFFSET ${offset}
   ```

4. **Statistics**: Aggregated queries on materialized views
   - Gender breakdown
   - State/nationality breakdown
   - Case status breakdown
   - Accused type breakdown
   - Age group breakdown

---

## Part 6: Frontend Compatibility Guarantees

### ✅ Fields That Remain Unchanged
- All physical features (beard, build, color, ear, eyes, face, hair, height, leucoderma, mole, mustache, nose, teeth)
- All person details (name, surname, alias, gender, age, occupation, etc.)
- All address fields (present/permanent: houseNo, street, ward, locality, district, state, pin, etc.)
- Contact info (phoneNumber, countryCode, emailId)
- Crime details (crimeId, firNumber, section, caseStatus, caseClassification)
- All JSONB nested objects structure

### ✅ Fields That Changed Implementation (But Same API)
- **accusedStatus**: Now uses new `a.accused_status` column with fallback chain
- **drugWithQuantity**: Now constructed from redesigned columns (weight_g, weight_kg, volume_ml, volume_l, count_total)

### ✅ New Fields Not Exposed to Frontend
- `additional_json_data` in crimes table
- `accused.accused_status` direct column (only used via COALESCE in views)

### ✅ Removed Tables Handled
- `brief_facts_drugs` → Data now in `brief_facts_drug` (different schema)
- `dedup_comparison_progress_backup` → Not used by frontend

---

## Part 7: Critical Implementation Notes

### 1. Materialized Views Must Be Refreshed
After schema migration, views must be refreshed:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_firs_mv;
```

### 2. Indexes Are Essential for Performance
The views include indexes for:
- Primary lookups (id, crimeId)
- Filtering (unit, ps, year, caseStatus, crimeType)
- Search (firNumber, firDate)

### 3. NULL Handling in COALESCE
Status field uses 3-level COALESCE:
```sql
COALESCE(bfa.status, a.accused_status, 'Unknown')
```
Order matters:
1. `bfa.status` from brief_facts_accused (highest priority)
2. `a.accused_status` from accused table (new column)
3. `'Unknown'` fallback

### 4. Drug Measurement Unit Handling
The new schema is more explicit about units:
- `weight_g` and `weight_kg` for weight
- `volume_ml` and `volume_l` for volume
- `count_total` for item count
- `raw_quantity` and `raw_unit` for original raw values

### 5. JSONB Array Aggregation
Multiple columns use JSONB aggregation:
- DISTINCT keyword prevents duplicates
- NULL filtering prevents null objects
- Array fallback `ARRAY[]::text[]` for empty results

---

## Part 8: Testing Checklist

Before deploying:

- [ ] Materialize views created successfully
- [ ] Indexes created on views
- [ ] Views contain expected column count
- [ ] AccusedType GraphQL query returns all fields
- [ ] FIR queries return all nested JSONB objects
- [ ] Filter queries work (by status, drug type, gender, etc.)
- [ ] Pagination works correctly
- [ ] Statistics aggregations work
- [ ] Advanced search queries return filtered results
- [ ] NULL handling works for optional fields
- [ ] Performance: View queries execute in < 500ms for 1000 rows

---

## Part 9: SQL Query Examples

### Query 1: Get Single Accused with All Details
```sql
SELECT * FROM accuseds_mv WHERE id = 'ACC001' LIMIT 1;
```
**Returns**: All 100+ fields including nested JSONB objects

### Query 2: Search Accused by Name with Filters
```sql
SELECT * FROM accuseds_mv 
WHERE 
  (name ILIKE '%john%' OR fullName ILIKE '%john%' OR surname ILIKE '%john%')
  AND gender = 'Male'
  AND age BETWEEN 20 AND 50
  AND unit = 'District Name'
ORDER BY crimeRegDate DESC
LIMIT 50 OFFSET 0;
```

### Query 3: Get Drug Statistics for FIR
```sql
SELECT 
  jsonb_array_elements("drugWithQuantity")->>'name' as drug_name,
  COUNT(*) as frequency
FROM firs_mv
WHERE year = 2024 AND "caseStatus" = 'Active'
GROUP BY drug_name
ORDER BY frequency DESC;
```

### Query 4: Get Accused by Crime ID
```sql
SELECT * FROM accuseds_mv WHERE "crimeId" = 'CRIME123';
```
**Returns**: All accused involved in that crime with full details

### Query 5: Count by Statistics
```sql
SELECT 
  gender AS label,
  COUNT(*)::int AS count
FROM accuseds_mv
WHERE unit = 'District Name'
GROUP BY gender
ORDER BY count DESC;
```

---

## Part 10: Troubleshooting Guide

### Issue: View Returns Fewer Columns Than Expected
**Cause**: Materialized view definition incomplete
**Solution**: Ensure MVs_newdb.sql includes all columns in SELECT clause

### Issue: NULL Values in Fields That Should Have Defaults
**Cause**: Missing COALESCE or wrong join type
**Solution**: Check view definition for proper LEFT JOINs and COALESCE chains

### Issue: Drug Quantities Missing
**Cause**: brief_facts_drug table missing or empty
**Solution**: Verify drug data migrated to new schema columns (weight_kg, volume_ml, count_total)

### Issue: Status Shows "Unknown" When Data Exists
**Cause**: Status in wrong table or COALESCE priority incorrect
**Solution**: Verify status values in both `brief_facts_accused.status` and `accused.accused_status`

### Issue: Performance Degradation
**Cause**: Indexes not created on materialized view
**Solution**: Run index creation statements at bottom of MVs_newdb.sql

---

## Part 11: Deployment Procedure

1. **Backup Current Database**
   ```sql
   pg_dump -Fc dopams_db > dopams_backup_$(date +%Y%m%d).dump
   ```

2. **Apply New Schema**
   ```sql
   psql -U postgres -d dopams_db -f DB-schema.sql
   ```

3. **Create Materialized Views**
   ```sql
   psql -U postgres -d dopams_db -f MVs_newdb.sql
   ```

4. **Verify Views**
   ```sql
   SELECT * FROM accuseds_mv LIMIT 1;
   SELECT * FROM firs_mv LIMIT 1;
   ```

5. **Test Backend Services**
   - Run unit tests
   - Verify API responses match expected schema

6. **Monitor Performance**
   - Check query execution times
   - Verify index usage
   - Monitor view refresh times

---

## Part 12: Migration Rollback Plan

If issues arise:

1. **Restore Database from Backup**
   ```bash
   pg_restore -d dopams_db dopams_backup_YYYYMMDD.dump
   ```

2. **Verify Old Schema Views**
   ```sql
   SELECT * FROM accuseds_mv LIMIT 1;
   ```

3. **Resume Old Operations**
   - Frontend continues to work unchanged
   - No code modifications needed

---

## Conclusion

The schema migration maintains **complete frontend compatibility** through:

1. **Materialized Views**: Serving as a compatibility/transformation layer
2. **Field Mapping**: Translating new schema columns to existing API fields
3. **COALESCE Chains**: Handling priority between multiple possible data sources
4. **JSONB Aggregation**: Reconstructing nested objects expected by frontend
5. **Index Strategy**: Ensuring performance remains unchanged

The frontend **requires NO modifications** and will continue to receive data in the exact same format as before.

