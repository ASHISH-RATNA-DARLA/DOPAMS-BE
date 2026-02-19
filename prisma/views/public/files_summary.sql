SELECT
  source_type,
  source_field,
  count(DISTINCT parent_id) AS parent_records_count,
  count(*) AS total_files,
  count(DISTINCT file_id) AS unique_files
FROM
  files
GROUP BY
  source_type,
  source_field;