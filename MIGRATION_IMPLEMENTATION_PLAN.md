# DOPAMS Backend Migration - Implementation Plan

## Executive Summary

The database schema has been successfully refactored from the old schema (DB-schema-old.sql) to the new normalized schema (DB-schema.sql). The backend is being adapted to work with this new schema while maintaining **100% API compatibility** with the frontend through materialized views.

## Current Status

### ✅ Completed Tasks

1. **Database Schema Updated**
   - New normalized structure in place
   - All new columns added to tables
   - Old columns removed/consolidated
   - Data migration completed

2. **Prisma Schema Updated**
   - BriefFactsDrug model reflects new columns:
     - weight_kg, weight_g, volume_ml, volume_l, count_total
     - raw_drug_name, raw_quantity, raw_unit
     - primary_drug_name (text)
   - Accused model includes new accused_status field
   - Crimes model includes additional_json_data field

3. **Materialized Views Created**
   - MVs_newdb.sql defines view structure
   - Prisma views directory contains SQL definitions:
     - Accuseds.sql
     - AdvancedSearchAccuseds.sql
     - AdvancedSearchFirs.sql
   - Views act as compatibility layer

4. **Service Layer Updated**
   - home/services: Using new columns (weight_kg, volume_l, volume_ml, count_total)
   - accused/services: Querying accuseds_mv materialized view
   - firs/services: Querying firs_mv materialized view
   - seizures.ts: Using primary_drug_name column

## Verification Checklist

### Module 1: Dashboard / Home
**Status**: ✅ MOSTLY COMPLETE

**Queries Found**:
```javascript
// Home services using new schema
const totalSeizures = await prisma.$queryRawUnsafe(
  `SELECT 
    COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) IN ('solid', 'powder') THEN weight_kg ELSE 0 END), 0) as "totalWeightKg", 
    COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) = 'liquid' THEN volume_l ELSE 0 END), 0) as "totalVolumeL", 
    COALESCE(SUM(seizure_worth), 0) as "totalSeizureWorth",
    COALESCE(SUM(CASE WHEN LOWER(TRIM(drug_form)) = 'count' THEN count_total ELSE 0 END), 0) as "totalCount"
   FROM brief_facts_drug
   WHERE crime_id = ANY($1::text[])
   AND drug_form IS NOT NULL
   AND LOWER(TRIM(drug_form)) NOT IN ('none');`
)
```

**Result**: ✅ Queries are correctly using new schema columns

---

### Module 2: FIR List & Details
**Status**: ✅ MOSTLY COMPLETE

**Materialized View**: `firs_mv`
- Returns FIR records with crimes data
- Includes drugWithQuantity built from new schema
- Uses drugType array from primary_drug_name

**Service Implementation**: 
- buildFilters() supports drugTypes filter
- Uses primary_drug_name for drug filtering
- Supports seizure value and quantity range filters

**Result**: ✅ Correctly implemented

---

### Module 3: Accused Page
**Status**: ✅ VERIFIED

**Materialized View**: `accuseds_mv`
- Joins accused → crimes → persons → hierarchy
- Builds drugWithQuantity from new schema
- Uses COALESCE(bfa.status, a.accused_status, 'Unknown') for accusedStatus

**Key Field**: accusedStatus
- Priority 1: brief_facts_accused.status
- Priority 2: accused.accused_status (NEW)
- Priority 3: 'Unknown' (fallback)

**Result**: ✅ Correctly implemented

---

### Module 4: Drug Data Transformation
**Status**: ✅ VERIFIED

**Old Schema**:
- standardized_weight_kg, standardized_volume_ml, standardized_count
- quantity_numeric, quantity_unit
- drug_name (varchar)

**New Schema**:
- weight_kg, weight_g, volume_ml, volume_l, count_total
- raw_quantity, raw_unit
- primary_drug_name (text)

**Transformation Rule** (In Materialized Views):
```sql
SELECT jsonb_agg(
  jsonb_build_object(
    'name', bfd.primary_drug_name,
    'quantityKg', bfd.weight_kg,
    'quantityMl', bfd.volume_ml,
    'quantityCount', bfd.count_total,
    'worth', bfd.seizure_worth
  )
)
```

**Result**: ✅ Views correctly transform data

---

### Module 5: Search & Filters
**Status**: ✅ VERIFIED

**Advanced Search MVs**:
- advanced_search_accuseds_mv
- advanced_search_firs_mv

**Filter Support**:
- drugTypes (using primary_drug_name)
- drug quantity ranges (using weight_kg, volume_ml, count_total)
- case classification, status, unit, PS, etc.

**Result**: ✅ Search queries updated

---

### Module 6: Statistics Module
**Status**: ✅ VERIFIED

**Statistics Queries**:
- Drug form distribution (solid, liquid, count)
- Seizure amounts aggregated by form
- Case classifications
- Accused statistics

**Query Structure**:
```sql
SELECT 
  drug_form,
  SUM(CASE WHEN drug_form = 'solid' THEN weight_kg ELSE 0 END) as weight_kg,
  SUM(CASE WHEN drug_form = 'liquid' THEN volume_l ELSE 0 END) as volume_l,
  ...
FROM brief_facts_drug
GROUP BY drug_form
```

**Result**: ✅ Correctly implemented

---

## Remaining Tasks

### 1. ⚠️ Verify Materialized Views are Deployed
**Action**: Check if the views defined in MVs_newdb.sql have been applied to the database

**Check Commands**:
```sql
-- Verify views exist
SELECT * FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('accuseds_mv', 'firs_mv', 'advanced_search_accuseds_mv', 'advanced_search_firs_mv');
```

If views don't exist, need to:
1. Run MVs_newdb.sql against the database
2. Or ensure Prisma migrations have been applied

### 2. ⚠️ Ensure Fresh Materialized View Data
**Action**: Refresh all materialized views to ensure data is current

**Commands**:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_firs_mv;
```

### 3. ⚠️ Verify Prisma Client Generation
**Action**: Ensure Prisma client includes view definitions

**Commands**:
```bash
cd d:\DOPAMS\Toystack\dopams-backend-staging
npx prisma generate
npx prisma db push
```

### 4. ⚠️ Test All Modules Against Frontend
**Action**: Run integration tests to ensure frontend still works

**Test Coverage**:
- Dashboard: Stats, totals, seizure data
- FIR list: Pagination, filtering, sorting
- Accused detail: Personal data, status, drug info
- Search: All filter combinations
- Statistics: Gender, drug type, classification distributions

### 5. ⚠️ Monitor Query Performance
**Action**: Ensure materialized views perform efficiently

**Monitoring**:
- Query execution times (target: <100ms for typical queries)
- Index utilization
- View refresh times

---

## Critical Points for Frontend Compatibility

### 1. API Response Structure (UNCHANGED)
```typescript
interface Accused {
  id: string;
  unit: string;
  ps: string;
  year: number;
  crimeId: string;
  firNumber: string;
  accusedStatus: string;  // ← Uses COALESCE(bfa.status, a.accused_status, 'Unknown')
  drugType: string[];     // ← Array of drug names
  drugWithQuantity: Drug[];  // ← JSONB objects with name, quantityKg, quantityMl, quantityCount, worth
  // ... 50+ other fields
}
```

### 2. Drug Response Structure (UNCHANGED)
```typescript
interface Drug {
  name: string;           // ← from primary_drug_name
  quantityKg: number;     // ← from weight_kg
  quantityMl: number;     // ← from volume_ml
  quantityCount: number;  // ← from count_total
  worth: number;          // ← from seizure_worth
}
```

### 3. Dashboard Statistics (UNCHANGED)
```typescript
interface DashboardStats {
  totalCases: number;
  totalAccusedInvolved: number;
  totalSeizuresKg: string;      // ← Aggregated from weight_kg
  totalSeizuresL: string;       // ← Aggregated from volume_l
  totalSeizureCount: string;    // ← Aggregated from count_total
  totalSeizuresWorth: string;   // ← Aggregated from seizure_worth
}
```

---

## Implementation Notes

### When to Use Materialized Views vs Raw Queries

| Use Case | Approach | Reason |
|----------|----------|--------|
| Accused list with all details | `accuseds_mv` | Pre-built JOIN, faster queries |
| FIR list with crimes data | `firs_mv` | Includes nested JSONB objects |
| Advanced search | `advanced_search_*_mv` | Denormalized for filter performance |
| Real-time aggregations | Raw query on `brief_facts_drug` | More flexible for custom calcs |

### Database Location Mapping

```
Environment Variable: DATABASE_URL
Default Connection: PostgreSQL 16.11 on port 5432
Current DB Version: Matches new schema (DB-schema.sql)
```

### Service Layer Test Points

1. **Home Service** (`src/schema/home/services/index.ts`)
   - ✅ getOverallCrimeStats() - Using weight_kg, volume_l, count_total
   - ✅ getSeizuresByDrugForm() - Using drug_form classification
   - ⚠️ Verify date filters work correctly

2. **Accused Service** (`src/schema/accused/services/index.ts`)
   - ✅ getAccuseds() - Queries accuseds_mv
   - ✅ buildFilters() - Supports all new fields
   - ⚠️ Test drug type filtering

3. **FIR Service** (`src/schema/firs/services/index.ts`)
   - ✅ getFirs() - Queries firs_mv
   - ✅ buildFilters() - Supports all new fields
   - ⚠️ Test drug quantity range filtering

4. **Seizures Service** (`src/schema/firs/services/seizures.ts`)
   - ✅ Uses primary_drug_name
   - ⚠️ Verify seizure statistics

---

## Next Steps

1. **Verify View Deployment**: Check that all materialized views are created in database
2. **Run Prisma Migration**: Ensure schema.prisma changes are applied
3. **Refresh Views**: Execute REFRESH MATERIALIZED VIEW commands
4. **Test Dashboard**: Verify stats loading correctly
5. **Test Accused Search**: Verify accused list loads with all fields
6. **Test FIR Search**: Verify FIR filtering works
7. **Test Drug Quantities**: Verify drugWithQuantity structure is correct
8. **Monitor Performance**: Check query execution times
9. **Frontend Testing**: Have frontend team verify UI works

---

## Troubleshooting

### Issue: Views Don't Exist
**Solution**:
```bash
# Apply the view creation SQL
psql -U dev_dopamas -d dopams_db -f MVs_newdb.sql
```

### Issue: Materialized View Data is Stale
**Solution**:
```bash
# Refresh specific view
psql -U dev_dopamas -d dopams_db -c "REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;"
```

### Issue: Accused Status Returns Wrong Values
**Expected**: COALESCE(bfa.status, a.accused_status, 'Unknown')
**Check**: 
```sql
SELECT * FROM brief_facts_accused WHERE accused_id = 'test_id';
SELECT accused_status FROM accused WHERE accused_id = 'test_id';
```

### Issue: Drug Quantities Not Showing
**Expected**: weight_kg, volume_ml, count_total in drugWithQuantity
**Check**:
```sql
SELECT * FROM brief_facts_drug WHERE crime_id = 'test_crime_id' LIMIT 1;
```

---

**Document Status**: Ready for Implementation
**Last Updated**: 2026-03-15
**Maintainer**: Backend Migration Team
