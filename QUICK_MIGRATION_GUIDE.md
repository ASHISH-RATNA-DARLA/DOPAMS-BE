# Quick Migration Guide - Developer Reference

## TL;DR

**Frontend needs NO changes.** The backend uses materialized views to transform the new schema into the old API contract.

---

## 1. Critical Files

| File | Purpose |
|---|---|
| `DB-schema.sql` | New normalized schema |
| `DB-schema-old.sql` | Old schema (reference only) |
| `MVs_newdb.sql` | Materialized views (THE KEY) |
| `SCHEMA_MIGRATION_ANALYSIS.md` | Detailed analysis |
| `FIELD_MAPPING_REFERENCE.md` | Field-by-field mappings |

---

## 2. Key Changes Summary

### 3 Tables Changed
- `accused` + new `accused_status` column
- `brief_facts_drug` - complete column restructuring
- `crimes` + new `additional_json_data` column

### 2 Tables Removed  
- `brief_facts_drugs`
- `dedup_comparison_progress_backup`

### 6 Tables Added
- `drug_categories`, `drug_ignore_list`, `geo_countries`, `geo_reference`, `ir_pending_fk`, `properties_pending_fk`

---

## 3. Migration Checklist

- [ ] Backup current database
- [ ] Apply `DB-schema.sql`
- [ ] Apply `MVs_newdb.sql`
- [ ] Verify views exist: `SELECT * FROM accuseds_mv LIMIT 1;`
- [ ] Test backend queries work
- [ ] Verify frontend receives expected data
- [ ] Monitor performance

---

## 4. Materialized Views (The Compatibility Layer)

### Views Created
1. **accuseds_mv** - Accused query view
2. **firs_mv** - FIR query view  
3. **advanced_search_accuseds_mv** - Advanced search view
4. **advanced_search_firs_mv** - Advanced search view

### View Refresh (After Data Changes)
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
```

---

## 5. Field Changes

### Only 2 Fields Have Actual Logic Changes

#### Change 1: accusedStatus
**What Changed**: Priority of status sources

**Old Logic**: Used `accused.type` or `brief_facts_accused.status`

**New Logic**: 
```sql
COALESCE(
  brief_facts_accused.status,    -- Priority 1
  accused.accused_status,         -- Priority 2 (NEW COLUMN)
  'Unknown'                        -- Fallback
)
```

**Frontend Impact**: ✅ NONE - Same field, same values

---

#### Change 2: drugWithQuantity
**What Changed**: Column names in brief_facts_drug table restructured

**Old Columns**: `drug_name`, `quantity_numeric`, `standardized_weight_kg`, etc.

**New Columns**: `primary_drug_name`, `weight_kg`, `weight_g`, `volume_ml`, `volume_l`, `count_total`

**View Handles**: Extracts new columns and builds JSONB object
```sql
jsonb_build_object(
  'name', bfd.primary_drug_name,      -- New column
  'quantityKg', bfd.weight_kg,        -- New column
  'quantityMl', bfd.volume_ml,        -- New column
  'quantityCount', bfd.count_total,   -- New column
  'worth', bfd.seizure_worth          -- Unchanged
)
```

**Frontend Impact**: ✅ NONE - Same JSONB structure

---

### All Other Fields: NO CHANGES
✅ All person fields unchanged  
✅ All crime fields unchanged  
✅ All physical features unchanged  
✅ All address fields unchanged  
✅ All computed fields unchanged  

---

## 6. Common Queries

### Get Single Accused
```typescript
// Backend service (src/schema/accused/services/index.ts)
const result = await prisma.$queryRawUnsafe<Accuseds[]>(
  `SELECT * FROM accuseds_mv WHERE id = $1 LIMIT 1;`,
  id
);
return result[0];
```

### Search Accused
```typescript
const result = await prisma.$queryRawUnsafe<Accuseds[]>(
  `SELECT * FROM accuseds_mv 
   WHERE name ILIKE $1 AND gender = $2
   ORDER BY crimeRegDate DESC
   LIMIT $3 OFFSET $4;`,
  `%${name}%`,
  gender,
  limit,
  offset
);
```

### Get FIR with All Details
```typescript
const result = await prisma.$queryRawUnsafe<FIRs[]>(
  `SELECT * FROM firs_mv WHERE id = $1 LIMIT 1;`,
  crimeId
);
```

### Advanced Search
```typescript
const result = await prisma.$queryRawUnsafe<AccusedsAdvanced[]>(
  `SELECT * FROM advanced_search_accuseds_mv 
   WHERE psCode = $1 AND firDate >= $2
   ORDER BY firDate DESC;`,
  psCode,
  startDate
);
```

---

## 7. Troubleshooting

### Problem: View doesn't exist
```sql
-- Check what views exist
SELECT * FROM information_schema.views 
WHERE table_schema = 'public';

-- Recreate missing views
psql -d dopams_db -f MVs_newdb.sql
```

### Problem: Null accusedStatus
**Cause**: Both source columns are NULL

**Check**:
```sql
SELECT id, 
  brief_facts_accused.status, 
  accused.accused_status
FROM accused 
LEFT JOIN brief_facts_accused USING(accused_id)
WHERE accused.accused_id = 'YOUR_ID';
```

### Problem: Missing drug data
**Cause**: Data not migrated to new columns

**Check**:
```sql
SELECT * FROM brief_facts_drug 
WHERE crime_id = 'YOUR_CRIME_ID';

-- Verify new columns exist and have data
SELECT crime_id, primary_drug_name, weight_kg, volume_ml, count_total 
FROM brief_facts_drug LIMIT 5;
```

### Problem: Slow queries
**Solution**: Verify indexes exist
```sql
-- Check indexes on materialized views
\d accuseds_mv
\d firs_mv

-- If missing, create them:
CREATE INDEX idx_accuseds_mv_id ON accuseds_mv (id);
CREATE INDEX idx_accuseds_mv_crimeId ON accuseds_mv ("crimeId");
```

---

## 8. Performance Expectations

| Query Type | Expected Time | View |
|---|---|---|
| Get by ID | < 10ms | accuseds_mv / firs_mv |
| List 50 records | < 100ms | accuseds_mv / firs_mv |
| Search by name (1000 results) | < 500ms | advanced_search_accuseds_mv |
| Statistics query | < 1000ms | accuseds_mv |

If slower, check:
1. Indexes exist: `\d accuseds_mv`
2. View is materialized: `SELECT * FROM pg_matviews;`
3. View is recent: `REFRESH MATERIALIZED VIEW accuseds_mv;`

---

## 9. Database Queries for Verification

### Verify New Schema Applied
```sql
-- Check accused table has new column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'accused' AND column_name = 'accused_status';

-- Result: Should show 'accused_status'
```

### Verify Materialized Views Created
```sql
SELECT matviewname FROM pg_matviews 
WHERE matviewname IN ('accuseds_mv', 'firs_mv');

-- Result: Should show all 4 views
```

### Verify Views Have Data
```sql
SELECT COUNT(*) FROM accuseds_mv;
SELECT COUNT(*) FROM firs_mv;
SELECT COUNT(*) FROM advanced_search_accuseds_mv;
SELECT COUNT(*) FROM advanced_search_firs_mv;
```

### Verify Field Mapping Works
```sql
-- Get a sample accusedStatus with proper COALESCE
SELECT 
  id,
  fullName,
  COALESCE(
    (SELECT status FROM brief_facts_accused bfa WHERE bfa.accused_id = accuseds_mv.id),
    (SELECT accused_status FROM accused a WHERE a.accused_id = accuseds_mv.id),
    'Unknown'
  ) as accusedStatus
FROM accuseds_mv LIMIT 5;
```

---

## 10. Deployment Order

1. **Backup**: `pg_dump -Fc dopams_db > backup.dump`
2. **Apply Schema**: `psql -d dopams_db -f DB-schema.sql`
3. **Create Views**: `psql -d dopams_db -f MVs_newdb.sql`
4. **Verify**: Run queries in section 9 above
5. **Test Backend**: Run unit tests for services
6. **Monitor**: Check logs for errors

---

## 11. Rollback Plan

If anything goes wrong:

```bash
# Restore backup
pg_restore -d dopams_db backup.dump

# Backend automatically works with old schema (no code changes)
npm restart
```

---

## 12. What Frontend Developers Need to Know

### ✅ Nothing

- GraphQL schema unchanged
- API responses identical
- No field changes
- No breaking changes

Just restart the backend services after deployment.

---

## 13. What Backend Developers Need to Know

### Changes in Services/Queries

**Before Migration**:
```typescript
// Might have queried different tables directly
SELECT * FROM accused WHERE crime_id = $1
```

**After Migration**:
```typescript
// Now query materialized view (already updated in codebase)
SELECT * FROM accuseds_mv WHERE crimeId = $1
```

**Status**: Already updated in `src/schema/accused/services/index.ts`

### Drug Data Handling

**Before**: Columns like `standardized_weight_kg`, `quantity_numeric`

**After**: Columns like `weight_kg`, `raw_quantity`, `count_total`

**Migration**: Already handled in views - no code changes needed

---

## 14. Performance Tuning

If views are slow:

### Step 1: Add Missing Indexes
```sql
-- accuseds_mv indexes
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_id ON accuseds_mv (id);
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_crimeId ON accuseds_mv ("crimeId");
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_personId ON accuseds_mv ("personId");
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_unit ON accuseds_mv (unit);
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_ps ON accuseds_mv (ps);
CREATE INDEX IF NOT EXISTS idx_accuseds_mv_year ON accuseds_mv (year);

-- firs_mv indexes
CREATE INDEX IF NOT EXISTS idx_firs_mv_id ON firs_mv (id);
CREATE INDEX IF NOT EXISTS idx_firs_mv_unit ON firs_mv (unit);
CREATE INDEX IF NOT EXISTS idx_firs_mv_ps ON firs_mv (ps);
```

### Step 2: Analyze Query Plans
```sql
EXPLAIN ANALYZE 
SELECT * FROM accuseds_mv WHERE id = 'ACC001';
```

### Step 3: Refresh Materialized Views
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
```

---

## 15. Quick Command Reference

```bash
# Connect to database
psql -U postgres -d dopams_db

# Apply new schema
psql -d dopams_db -f DB-schema.sql

# Create views
psql -d dopams_db -f MVs_newdb.sql

# Backup database
pg_dump -Fc dopams_db > dopams_backup_$(date +%Y%m%d).dump

# Restore database
pg_restore -d dopams_db dopams_backup_YYYYMMDD.dump

# Check backend service logs
npm run dev  # or relevant start command
```

---

## 16. Contact & Questions

**If schema or mapping questions**:
- See: `SCHEMA_MIGRATION_ANALYSIS.md`
- See: `FIELD_MAPPING_REFERENCE.md`

**If performance issues**:
- Check: Database indexes (section 14)
- Check: View refresh status
- Check: Query plans (`EXPLAIN ANALYZE`)

**If data issues**:
- Verify: Views contain expected columns
- Verify: New schema columns populated with data
- Check: COALESCE logic for status field

