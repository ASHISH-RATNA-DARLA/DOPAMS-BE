SELECT
  person_fingerprint,
  matching_tier,
  matching_strategy,
  canonical_person_id,
  full_name,
  relative_name,
  age,
  phone_number,
  present_district,
  person_record_count,
  crime_count,
  CASE
    WHEN (matching_tier = 1) THEN 'Very High'::text
    WHEN (matching_tier = 2) THEN 'High'::text
    WHEN (matching_tier = 3) THEN 'Good'::text
    WHEN (matching_tier = 4) THEN 'Medium'::text
    WHEN (matching_tier = 5) THEN 'Basic'::text
    ELSE NULL::text
  END AS confidence_level,
  confidence_score,
  CASE
    WHEN (crime_count > 5) THEN 'Repeat Offender'::text
    WHEN (crime_count > 2) THEN 'Multiple Cases'::text
    WHEN (crime_count = 1) THEN 'Single Case'::text
    ELSE 'No Cases'::text
  END AS offender_category,
  created_at,
  updated_at
FROM
  person_deduplication_tracker
ORDER BY
  crime_count DESC,
  matching_tier;