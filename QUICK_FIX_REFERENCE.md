# Materialized View Fixes - Quick Reference

## Problem Summary
Your reconstruction SQL has **4 critical issues** that will cause backend queries to fail.

---

## ISSUE #1: Wrong Drug Column Names (Affects ALL drug queries)

### ❌ What Your SQL Uses
```sql
SELECT ... 
  bfd.primary_drug_name,
  bfd.weight_kg,
  bfd.volume_ml,
  bfd.volume_l,
  bfd.count_total
FROM brief_facts_drug bfd
```

### ✅ What It Should Be
```sql
SELECT ... 
  bfd.drug_name,
  bfd.standardized_weight_kg,
  bfd.standardized_volume_ml,
  -- volume_l DOES NOT EXIST, remove it
  bfd.standardized_count
FROM brief_facts_drug bfd
```

### Where to Fix
- ❌ accuseds_mv - lines 77-82 (drugType), 84-92 (drugWithQuantity)
- ❌ firs_mv - lines 160-165 (drugType), 167-178 (drugWithQuantity)
- ❌ advanced_search_accuseds_mv - lines 291-304 (drugDetails)
- ❌ advanced_search_firs_mv - lines 345-358 (drugDetails)

### Impact
- ✗ Will throw: `"column bfd.primary_drug_name does not exist"`
- ✗ 40+ backend queries will fail
- ✗ All seizure reports will crash

---

## ISSUE #2: Non-Existent accused_status Column

### ❌ What Your SQL Uses
```sql
COALESCE(bfa.status, a.accused_status, 'Unknown') AS "accusedStatus"
```

### ✅ What It Should Be
```sql
COALESCE(bfa.status, 'Unknown') AS "accusedStatus"
```

### Explanation
- The `accused` table does NOT have an `accused_status` field
- Only `brief_facts_accused` table has a `status` field
- When there's no BriefFactsAccused record, default to 'Unknown'

### Where to Fix
- ❌ accuseds_mv - line 33 (main query), line 43 (subquery)
- ❌ advanced_search_accuseds_mv - line 250

### Impact
- ✗ Will throw: `"column a.accused_status does not exist"`
- ✗ getAccused() and getAccuseds() will fail
- ✗ Can't retrieve any accused records

---

## ISSUE #3: Missing crimes JSONB Field in criminal_profiles_mv

### ❌ Your Current View
```sql
-- The "crimes" field is NOT in your view, but it's used by backend
SELECT ... 
  "previouslyInvolvedCases",  -- exists
  -- "crimes" is MISSING but backend expects it
FROM persons p
...
```

### ✅ What You Need to Add
```sql
SELECT ...
  (
    SELECT jsonb_agg(jsonb_build_object(
      'id', c.crime_id,
      'firNumber', c.fir_num,
      'crimeRegDate', c.fir_date
    ))
    FROM accused a
    INNER JOIN crimes c ON a.crime_id = c.crime_id
    WHERE a.person_id = p.person_id
  ) AS crimes,  -- <-- THIS FIELD IS CRITICAL
  ...
FROM persons p
```

### Backend Usage
```sql
-- Line 555 in home/services/index.ts:
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cp.crimes, '[]'::jsonb)) AS crime
WHERE crime->>'crimeRegDate' IS NOT NULL
```

### Impact
- ✗ Will throw: `"column cp.crimes does not exist"`
- ✗ getDomicileClassification() will crash
- ✗ Home dashboard domain stats won't load

---

## ISSUE #4: Non-Existent identity_documents Field

### ❌ What Your SQL Uses
```sql
p.identity_documents AS "identityDocuments"
```

### ✅ What It Should Be
```sql
-- Remove this line, the field doesn't exist in Persons table
-- Keep other person fields as is
```

### Explanation
The Persons table in the Prisma schema does NOT have an `identity_documents` field.

### Impact
- ⚠️ Field will be NULL
- ⚠️ View may still work but will return NULL for this column
- ✗ Queries that depend on this field will fail

---

## Quick Fix Checklist

### For accuseds_mv
- [ ] Line 33: Fix `a.accused_status` → remove it, keep only `bfa.status`
- [ ] Line 43: Same fix in subquery
- [ ] Line 78: Fix `bfd.primary_drug_name` → `bfd.drug_name`
- [ ] Line 87: Fix `bfd.weight_kg` → `bfd.standardized_weight_kg`
- [ ] Line 88: Fix `bfd.volume_ml` → `bfd.standardized_volume_ml`
- [ ] Line 89: Remove `bfd.volume_l` (doesn't exist)
- [ ] Line 90: Fix `bfd.count_total` → `bfd.standardized_count`

### For firs_mv
- [ ] Line 161: Fix `bfd.primary_drug_name` → `bfd.drug_name`
- [ ] Line 170: Fix `bfd.weight_kg` → `bfd.standardized_weight_kg`
- [ ] Line 171: Fix `bfd.volume_ml` → `bfd.standardized_volume_ml`
- [ ] Line 172: Remove `bfd.volume_l`
- [ ] Line 173: Fix `bfd.count_total` → `bfd.standardized_count`

### For advanced_search_accuseds_mv
- [ ] Line 250: Fix `a.accused_status` reference
- [ ] Line 295: Fix `bfd.drug_name`
- [ ] Line 296: Fix `bfd.standardized_weight_kg`
- [ ] Line 297: Fix `bfd.standardized_volume_ml`
- [ ] Line 298: Fix `bfd.standardized_count`

### For advanced_search_firs_mv
- [ ] Line 348: Fix `bfd.drug_name`
- [ ] Line 349: Fix `bfd.standardized_weight_kg`
- [ ] Line 350: Fix `bfd.standardized_volume_ml`
- [ ] Line 351: Fix `bfd.standardized_count`

### For criminal_profiles_mv
- [ ] Remove reference to `p.identity_documents` (doesn't exist)
- [ ] **ADD the missing crimes field** (critical!)
- [ ] Fix `bfd.drug_name`
- [ ] Fix `bfd.standardized_weight_kg`
- [ ] Fix `bfd.standardized_volume_ml`
- [ ] Fix `bfd.standardized_count`

---

## Schema Reference (From Prisma Model)

### brief_facts_drug Table
```
Actual Columns in Schema:
- drug_name (NOT primary_drug_name) ✗
- standardized_weight_kg (NOT weight_kg) ✗
- standardized_volume_ml (NOT volume_ml) ✗
- standardized_count (NOT count_total) ✗
- seizure_worth
- crime_id
```

### accused Table
```
Actual Columns in Schema:
- accused_id ✓
- accused_code ✓
- type ✓
- seq_num ✓
- is_ccl ✓
- crime_id ✓
- person_id ✓
- beard, build, color, ear, eyes, face, hair, height, leucoderma, mole, mustache, nose, teeth ✓
- NO: accused_status ❌ (doesn't exist)
```

### persons Table
```
Actual Columns in Schema:
- person_id ✓
- name, surname, alias, full_name ✓
- all address fields ✓
- domicile_classification ✓
- NO: identity_documents ❌ (doesn't exist)
```

### brief_facts_accused Table
```
Actual Columns:
- status ✓ (this is where accused status comes from)
```

---

## Testing After Fix

```sql
-- Test 1: accuseds_mv drugType works
SELECT DISTINCT a."drugType" FROM accuseds_mv a LIMIT 5;

-- Test 2: firs_mv drugWithQuantity works
SELECT f."drugWithQuantity" FROM firs_mv f WHERE f."drugWithQuantity" IS NOT NULL LIMIT 1;

-- Test 3: criminal_profiles_mv crimes field exists and works
SELECT jsonb_array_length(cp.crimes) FROM criminal_profiles_mv cp WHERE cp.crimes IS NOT NULL LIMIT 1;

-- Test 4: accused status has real values
SELECT DISTINCT a."accusedStatus" FROM accuseds_mv a LIMIT 10;
```

---

## Deploy Instructions

1. **Do NOT use the original reconstruction SQL**
   ```sql
   -- ❌ DON'T USE THIS:
   -- Your user-provided SQL has the 4 critical issues above
   ```

2. **USE the corrected SQL**
   ```bash
   # Use MATERIALIZED_VIEWS_CORRECTED.sql instead
   psql -d dopams_db -f MATERIALIZED_VIEWS_CORRECTED.sql
   ```

3. **Verify**
   ```sql
   \d accuseds_mv
   \d firs_mv
   \d criminal_profiles_mv
   -- All should exist with all columns
   ```

4. **Test**
   ```
   Run backend tests:
   - npm test
   - Test getAccused()
   - Test getFirs()
   - Test getDomicileClassification()
   ```

---

## Support Reference

- **Full Audit Report**: MATERIALIZED_VIEW_COMPATIBILITY_AUDIT.md
- **Corrected SQL**: MATERIALIZED_VIEWS_CORRECTED.sql
- **Executive Summary**: AUDIT_EXECUTIVE_SUMMARY.md

---

**Last Updated**: 2026-03-13  
**Status**: ⚠️ Critical Issues - Use Corrected SQL
