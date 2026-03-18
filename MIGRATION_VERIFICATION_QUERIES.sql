-- ============================================================================
-- MIGRATION VERIFICATION QUERIES
-- ============================================================================
-- Use these queries to verify the schema migration is complete and correct
-- ============================================================================

-- =============================================================================
-- SECTION 1: VERIFY NEW SCHEMA STRUCTURE
-- =============================================================================

-- 1.1 Check if new schema applied successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'accused' 
  AND column_name IN ('accused_status', 'accused_id', 'crime_id')
ORDER BY ordinal_position;

-- Expected: 3 rows showing accused_status as text/character varying

-- 1.2 Verify brief_facts_drug has new columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'brief_facts_drug'
ORDER BY ordinal_position;

-- Expected: Should show weight_kg, weight_g, volume_ml, volume_l, count_total, etc.
-- Expected: Should NOT show standardized_weight_kg, quantity_numeric, etc.

-- 1.3 Check crimes table has new column
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'crimes' 
  AND column_name = 'additional_json_data';

-- Expected: 1 row showing jsonb type

-- 1.4 Verify removed tables don't exist
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_name IN ('brief_facts_drugs', 'dedup_comparison_progress_backup')
  AND table_schema = 'public';

-- Expected: 0 (should return 0 rows)

-- 1.5 Verify new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN (
  'drug_categories', 'drug_ignore_list', 'geo_countries', 
  'geo_reference', 'ir_pending_fk', 'properties_pending_fk'
)
  AND table_schema = 'public'
ORDER BY table_name;

-- Expected: 6 rows with all new tables

-- =============================================================================
-- SECTION 2: VERIFY MATERIALIZED VIEWS
-- =============================================================================

-- 2.1 Check all required materialized views exist
SELECT matviewname
FROM pg_matviews
WHERE matviewname IN (
  'accuseds_mv',
  'firs_mv',
  'advanced_search_accuseds_mv',
  'advanced_search_firs_mv'
)
ORDER BY matviewname;

-- Expected: 4 rows

-- 2.2 Check accuseds_mv has all required columns
SELECT 
  attname as column_name,
  atttypid::regtype as data_type
FROM pg_attribute
WHERE attrelid = (
  SELECT oid FROM pg_class WHERE relname = 'accuseds_mv'
)
  AND attnum > 0
ORDER BY attnum;

-- Expected: 100+ columns including 'id', 'crimeId', 'accusedStatus', 'drugWithQuantity', etc.

-- 2.3 Check firs_mv has expected columns
SELECT 
  attname as column_name,
  atttypid::regtype as data_type
FROM pg_attribute
WHERE attrelid = (
  SELECT oid FROM pg_class WHERE relname = 'firs_mv'
)
  AND attnum > 0
  AND attname IN ('id', 'crimeId', 'drugWithQuantity', 'accusedDetails')
ORDER BY attnum;

-- Expected: 4+ rows

-- 2.4 Check view row counts
SELECT 
  'accuseds_mv' as view_name,
  (SELECT COUNT(*) FROM accuseds_mv) as row_count
UNION ALL
SELECT 
  'firs_mv' as view_name,
  (SELECT COUNT(*) FROM firs_mv) as row_count
UNION ALL
SELECT 
  'advanced_search_accuseds_mv' as view_name,
  (SELECT COUNT(*) FROM advanced_search_accuseds_mv) as row_count
UNION ALL
SELECT 
  'advanced_search_firs_mv' as view_name,
  (SELECT COUNT(*) FROM advanced_search_firs_mv) as row_count;

-- Expected: All should have row_count > 0 if data migrated

-- =============================================================================
-- SECTION 3: VERIFY DATA INTEGRITY
-- =============================================================================

-- 3.1 Check accused_status column is populated
SELECT 
  COUNT(*) as total_records,
  COUNT(accused_status) as records_with_status,
  COUNT(NULLIF(accused_status, '')) as records_with_non_empty_status
FROM accused;

-- Expected: total_records > 0

-- 3.2 Check brief_facts_drug has new data in correct columns
SELECT 
  COUNT(*) as total_drugs,
  COUNT(primary_drug_name) as with_drug_name,
  COUNT(weight_kg) as with_weight_kg,
  COUNT(weight_g) as with_weight_g,
  COUNT(volume_ml) as with_volume_ml,
  COUNT(count_total) as with_count
FROM brief_facts_drug;

-- Expected: total_drugs > 0, other counts indicate data population

-- 3.3 Check if old drug columns were removed
SELECT 1
FROM information_schema.columns
WHERE table_name = 'brief_facts_drug'
  AND column_name IN (
    'standardized_weight_kg',
    'standardized_volume_ml',
    'quantity_numeric',
    'quantity_unit'
  );

-- Expected: 0 rows (columns should be gone)

-- 3.4 Verify crimes.additional_json_data exists
SELECT COUNT(*)
FROM crimes
WHERE additional_json_data IS NOT NULL;

-- Expected: >= 0 (may be empty initially)

-- =============================================================================
-- SECTION 4: VERIFY MAPPING LOGIC
-- =============================================================================

-- 4.1 Verify accusedStatus field works correctly in view
SELECT 
  COUNT(*) as total,
  COUNT(NULLIF("accusedStatus", 'Unknown')) as non_unknown,
  COUNT(CASE WHEN "accusedStatus" = 'Unknown' THEN 1 END) as unknown_count
FROM accuseds_mv;

-- Expected: total > 0

-- 4.2 Check accusedStatus mapping for specific record
SELECT 
  id,
  "accusedStatus",
  (SELECT status FROM brief_facts_accused bfa WHERE bfa.accused_id = accuseds_mv.id) as bfa_status,
  (SELECT accused_status FROM accused a WHERE a.accused_id = accuseds_mv.id) as a_status
FROM accuseds_mv
LIMIT 5;

-- Expected: Shows how COALESCE resolves status from multiple sources

-- 4.3 Verify drugWithQuantity field structure
SELECT 
  id,
  jsonb_typeof("drugWithQuantity") as type,
  (
    CASE 
      WHEN "drugWithQuantity" IS NOT NULL THEN 'Has data'
      ELSE 'NULL'
    END
  ) as has_data,
  jsonb_array_length("drugWithQuantity") as drug_count
FROM accuseds_mv
WHERE "drugWithQuantity" IS NOT NULL
LIMIT 10;

-- Expected: Shows JSONB structure and drug count per crime

-- 4.4 Check drug object structure
SELECT 
  jsonb_array_elements("drugWithQuantity") as drug_object
FROM firs_mv
WHERE "drugWithQuantity" IS NOT NULL
LIMIT 5;

-- Expected: Shows JSONB objects with 'name', 'quantityKg', 'quantityMl', 'quantityCount', 'worth'

-- 4.5 Verify person fields mapped correctly
SELECT 
  id,
  fullName,
  gender,
  age,
  nationality,
  presentStateUt,
  permanentStateUt
FROM accuseds_mv
LIMIT 5;

-- Expected: All person fields present and populated

-- =============================================================================
-- SECTION 5: PERFORMANCE VERIFICATION
-- =============================================================================

-- 5.1 Check indexes exist on materialized views
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('accuseds_mv', 'firs_mv')
ORDER BY tablename, indexname;

-- Expected: Multiple indexes on each view for id, crimeId, year, unit, ps

-- 5.2 Test query performance - simple lookup
EXPLAIN ANALYZE
SELECT * FROM accuseds_mv WHERE id = 'ACC001' LIMIT 1;

-- Expected: Execution time < 10ms with index

-- 5.3 Test query performance - search query
EXPLAIN ANALYZE
SELECT * FROM accuseds_mv 
WHERE (fullName ILIKE '%john%' OR surname ILIKE '%john%')
  AND gender = 'Male'
ORDER BY "crimeRegDate" DESC
LIMIT 50;

-- Expected: Execution time < 100ms

-- 5.4 Check materialized view refresh status
SELECT 
  schemaname,
  matviewname,
  ispopulated
FROM pg_matviews
ORDER BY matviewname;

-- Expected: All true, indicating views are populated

-- =============================================================================
-- SECTION 6: MIGRATION COMPLETENESS CHECK
-- =============================================================================

-- 6.1 Summary of all changes
SELECT 
  'Accused Status Column' as check_item,
  COUNT(*) as affected_records
FROM accused
WHERE accused_status IS NOT NULL
UNION ALL
SELECT 
  'Brief Facts Drug New Columns' as check_item,
  COUNT(*) as affected_records
FROM brief_facts_drug
WHERE weight_kg IS NOT NULL OR volume_ml IS NOT NULL
UNION ALL
SELECT 
  'Crimes Additional JSON' as check_item,
  COUNT(*) as affected_records
FROM crimes
WHERE additional_json_data IS NOT NULL
UNION ALL
SELECT 
  'Accuseds MV Rows' as check_item,
  COUNT(*) as affected_records
FROM accuseds_mv
UNION ALL
SELECT 
  'FIRs MV Rows' as check_item,
  COUNT(*) as affected_records
FROM firs_mv;

-- Expected: Shows impact of migration across all changed areas

-- 6.2 Check for orphaned or missing data
SELECT 
  a.accused_id,
  CASE WHEN c.crime_id IS NULL THEN 'Crime missing' ELSE 'OK' END as status
FROM accused a
LEFT JOIN crimes c ON a.crime_id = c.crime_id
WHERE c.crime_id IS NULL
LIMIT 10;

-- Expected: 0 rows if data integrity maintained

-- 6.3 Verify foreign key relationships
SELECT 
  a.accused_id,
  a.crime_id,
  c.crime_id as crime_exists,
  a.person_id,
  p.person_id as person_exists
FROM accused a
LEFT JOIN crimes c ON a.crime_id = c.crime_id
LEFT JOIN persons p ON a.person_id = p.person_id
WHERE (c.crime_id IS NULL OR (a.person_id IS NOT NULL AND p.person_id IS NULL))
LIMIT 10;

-- Expected: 0 rows if relationships are intact

-- =============================================================================
-- SECTION 7: DIAGNOSTIC QUERIES FOR TROUBLESHOOTING
-- =============================================================================

-- 7.1 If drugWithQuantity is NULL or empty, check brief_facts_drug
SELECT 
  c.crime_id,
  COUNT(bfd.id) as drug_records,
  STRING_AGG(bfd.primary_drug_name, ', ') as drug_names
FROM crimes c
LEFT JOIN brief_facts_drug bfd ON c.crime_id = bfd.crime_id
GROUP BY c.crime_id
HAVING COUNT(bfd.id) = 0
LIMIT 10;

-- Expected: Shows which crimes have no drug records

-- 7.2 If accusedStatus shows 'Unknown', check both sources
SELECT 
  a.accused_id,
  a.accused_status,
  bfa.status,
  COALESCE(bfa.status, a.accused_status, 'Unknown') as final_status
FROM accused a
LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
WHERE a.accused_status IS NULL AND bfa.status IS NULL
LIMIT 20;

-- Expected: Shows records with missing status data

-- 7.3 If view is slow, check table statistics
SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE tablename IN ('accused', 'crimes', 'persons', 'brief_facts_drug', 'brief_facts_accused')
ORDER BY tablename;

-- Expected: Shows if VACUUM/ANALYZE is needed

-- 7.4 If queries are timing out, check for missing indexes
SELECT 
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('accuseds_mv', 'firs_mv')
ORDER BY idx_scan DESC;

-- Expected: Shows which indexes are actually being used

-- 7.5 Check view dependencies
SELECT 
  v.table_name as view_name,
  t.table_name as dependent_table
FROM information_schema.views v
INNER JOIN information_schema.view_column_usage t 
  ON v.table_catalog = t.view_catalog 
  AND v.table_schema = t.view_schema 
  AND v.table_name = t.view_name
WHERE v.table_name IN ('accuseds_mv', 'firs_mv')
ORDER BY v.table_name, t.table_name;

-- Expected: Shows all tables used by each view

-- =============================================================================
-- SECTION 8: POST-MIGRATION CHECKLIST (Run These in Order)
-- =============================================================================

-- 8.1 Run VACUUM to reclaim space and update statistics
VACUUM ANALYZE;

-- 8.2 Reindex materialized views
REINDEX INDEX idx_accuseds_mv_id;
REINDEX INDEX idx_firs_mv_id;

-- 8.3 Refresh materialized views to ensure latest data
REFRESH MATERIALIZED VIEW CONCURRENTLY accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY firs_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_accuseds_mv;
REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_search_firs_mv;

-- 8.4 Final verification - run all checks from Section 2-4
-- (Copy queries from sections 2-4 above)

-- =============================================================================
-- SECTION 9: QUICK HEALTH CHECK (Run this to verify everything)
-- =============================================================================

WITH checks AS (
  SELECT 'Schema Applied' as check_name,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accused' AND column_name = 'accused_status'
      ) THEN 'PASS' ELSE 'FAIL' 
    END as status
  UNION ALL
  SELECT 'MVs Created',
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_matviews 
        WHERE matviewname IN ('accuseds_mv', 'firs_mv')) = 2 
      THEN 'PASS' ELSE 'FAIL' 
    END
  UNION ALL
  SELECT 'Data in Views',
    CASE 
      WHEN (SELECT COUNT(*) FROM accuseds_mv) > 0 
      THEN 'PASS' ELSE 'FAIL' 
    END
  UNION ALL
  SELECT 'Indexes Exist',
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_indexes 
        WHERE tablename = 'accuseds_mv') > 0 
      THEN 'PASS' ELSE 'FAIL' 
    END
  UNION ALL
  SELECT 'Status Mapping',
    CASE 
      WHEN (SELECT COUNT(DISTINCT "accusedStatus") FROM accuseds_mv) > 0 
      THEN 'PASS' ELSE 'FAIL' 
    END
  UNION ALL
  SELECT 'Drug Data',
    CASE 
      WHEN (SELECT COUNT(*) FROM brief_facts_drug WHERE weight_kg IS NOT NULL OR volume_ml IS NOT NULL) > 0 
      THEN 'PASS' ELSE 'FAIL' 
    END
)
SELECT check_name, status FROM checks ORDER BY check_name;

-- Expected: All PASS

-- =============================================================================
-- SECTION 10: ROLLBACK VERIFICATION (If Issues Arise)
-- =============================================================================

-- 10.1 Before rollback - get current counts
SELECT 
  'Pre-Rollback' as phase,
  (SELECT COUNT(*) FROM accused) as accused_count,
  (SELECT COUNT(*) FROM crimes) as crimes_count,
  (SELECT COUNT(*) FROM accuseds_mv) as accuseds_mv_count,
  NOW() as timestamp;

-- 10.2 After rollback - verify counts match
SELECT 
  'Post-Rollback' as phase,
  (SELECT COUNT(*) FROM accused) as accused_count,
  (SELECT COUNT(*) FROM crimes) as crimes_count,
  (SELECT COUNT(*) FROM persons) as persons_count,
  NOW() as timestamp;

-- Expected: Counts should match pre-migration if rollback is successful

-- =============================================================================
-- END OF VERIFICATION QUERIES
-- =============================================================================
