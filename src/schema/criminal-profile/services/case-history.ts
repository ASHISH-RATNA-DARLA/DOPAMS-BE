import { prisma } from 'datasources/prisma';
import ResourceNotFoundException from 'utils/errors/resource-not-found';

/**
 * Get complete case history for an accused using deduplication table.
 * Falls back to regular tables if person isn't in deduplication tracker.
 *
 * Accepts both accused_id AND person_id.
 */
export async function getAccusedCaseHistory(accusedIdOrPersonId: string) {
  const accusedId = accusedIdOrPersonId;

  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint  AS "personFingerprint",
      pdt.matching_strategy   AS "matchingStrategy",
      pdt.matching_tier       AS "matchingTier",
      CASE 
        WHEN pdt.matching_tier = 1 THEN 'Very High (★★★★★)'
        WHEN pdt.matching_tier = 2 THEN 'High (★★★★☆)'
        WHEN pdt.matching_tier = 3 THEN 'Good (★★★☆☆)'
        WHEN pdt.matching_tier = 4 THEN 'Medium (★★☆☆☆)'
        WHEN pdt.matching_tier = 5 THEN 'Basic (★☆☆☆☆)'
        ELSE 'Unknown'
      END                     AS "confidenceLevel",
      pdt.canonical_person_id AS "canonicalPersonId",
      pdt.full_name           AS "fullName",
      pdt.relative_name       AS "parentName",
      pdt.age,
      pdt.present_district    AS district,
      pdt.phone_number        AS phone,
      pdt.crime_count         AS "totalCrimes",
      pdt.person_record_count AS "totalDuplicateRecords",
      pdt.all_person_ids      AS "allPersonIds",
      pdt.all_accused_ids     AS "allAccusedIds",
      pdt.crime_details       AS "crimeDetails",
      pdt.confidence_score    AS "confidenceScore"
    FROM person_deduplication_tracker pdt
    WHERE ${accusedId} = ANY(pdt.all_accused_ids)
       OR ${accusedId} = ANY(pdt.all_person_ids)
  `;

  if (result.length > 0) {
    return result[0];
  }

  // FALLBACK: Person not in deduplication tracker
  const fallbackResult = await prisma.$queryRaw<any[]>`
    SELECT 
      NULL::TEXT              AS "personFingerprint",
      'Fallback: Regular Query (insufficient data for deduplication)' AS "matchingStrategy",
      NULL::SMALLINT          AS "matchingTier",
      'Not Available - Insufficient Data' AS "confidenceLevel",
      p.person_id             AS "canonicalPersonId",
      p.full_name             AS "fullName",
      p.relative_name         AS "parentName",
      p.age,
      p.present_district      AS district,
      p.phone_number          AS phone,
      1                       AS "totalCrimes",
      1                       AS "totalDuplicateRecords",
      ARRAY[p.person_id]      AS "allPersonIds",
      ARRAY[a.accused_id]     AS "allAccusedIds",
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'crimeId',      c.crime_id,
          'accusedId',    a.accused_id,
          'firNum',       c.fir_num,
          'firRegNum',    c.fir_reg_num,
          'firDate',      c.fir_date,
          'caseStatus',   c.case_status,
          'psName',       h.ps_name,
          'distName',     h.dist_name,
          'accusedCode',  bfa.person_code,
          'accusedType',  bfa.accused_type,
          'accusedStatus',COALESCE(bfa.status, a.accused_status)
        )
      )                       AS "crimeDetails",
      NULL::NUMERIC           AS "confidenceScore"
    FROM accused a
    JOIN persons p   ON a.person_id  = p.person_id
    JOIN crimes c    ON a.crime_id   = c.crime_id
    LEFT JOIN hierarchy h          ON c.ps_code   = h.ps_code
    LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
    WHERE a.accused_id = ${accusedId} OR p.person_id = ${accusedId}
    GROUP BY 
      p.person_id, p.full_name, p.relative_name, p.age,
      p.present_district, p.phone_number, a.accused_id
  `;

  if (fallbackResult.length === 0) {
    throw new ResourceNotFoundException('Accused not found in the system. Please check the ID.');
  }

  return fallbackResult[0];
}

/**
 * Get case history by person ID.
 * Returns camelCase aliases to match GraphQL AccusedCaseHistoryType.
 */
export async function getPersonCaseHistory(personId: string) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint  AS "personFingerprint",
      pdt.matching_strategy   AS "matchingStrategy",
      pdt.matching_tier       AS "matchingTier",
      CASE 
        WHEN pdt.matching_tier = 1 THEN 'Very High (★★★★★)'
        WHEN pdt.matching_tier = 2 THEN 'High (★★★★☆)'
        WHEN pdt.matching_tier = 3 THEN 'Good (★★★☆☆)'
        WHEN pdt.matching_tier = 4 THEN 'Medium (★★☆☆☆)'
        WHEN pdt.matching_tier = 5 THEN 'Basic (★☆☆☆☆)'
        ELSE 'Unknown'
      END                     AS "confidenceLevel",
      pdt.canonical_person_id AS "canonicalPersonId",
      pdt.full_name           AS "fullName",
      pdt.relative_name       AS "parentName",
      pdt.age,
      pdt.present_district    AS district,
      pdt.phone_number        AS phone,
      pdt.all_person_ids      AS "allPersonIds",
      pdt.all_accused_ids     AS "allAccusedIds",
      pdt.crime_count         AS "totalCrimes",
      pdt.person_record_count AS "totalDuplicateRecords",
      pdt.crime_details       AS "crimeDetails",
      pdt.confidence_score    AS "confidenceScore"
    FROM person_deduplication_tracker pdt
    WHERE ${personId} = ANY(pdt.all_person_ids)
  `;

  if (result.length === 0) {
    throw new ResourceNotFoundException('Person not found in deduplication tracker');
  }

  return result[0];
}

/**
 * Search persons by name.
 * Returns camelCase aliases to match GraphQL PersonSearchResultType.
 */
export async function searchPersonsByName(searchName: string) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint  AS "personFingerprint",
      pdt.matching_strategy   AS "matchingStrategy",
      pdt.full_name           AS "fullName",
      pdt.relative_name       AS "parentName",
      pdt.age,
      pdt.present_district    AS district,
      pdt.phone_number        AS phone,
      pdt.crime_count         AS "totalCrimes",
      pdt.person_record_count AS "totalDuplicateRecords"
    FROM person_deduplication_tracker pdt
    WHERE LOWER(pdt.full_name) LIKE LOWER(${'%' + searchName + '%'})
    ORDER BY pdt.crime_count DESC, pdt.full_name ASC
    LIMIT 50
  `;

  return result;
}

/**
 * Get statistics about deduplication.
 */
export async function getDeduplicationStatistics() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*)                                                    AS "totalUniquePersons",
      SUM(person_record_count)                                    AS "totalPersonRecords",
      SUM(person_record_count) - COUNT(*)                        AS "duplicateRecordsFound",
      COUNT(*) FILTER (WHERE person_record_count > 1)            AS "personsWithDuplicates",
      COUNT(*) FILTER (WHERE crime_count > 1)                    AS "repeatOffenders",
      ROUND(AVG(crime_count), 2)                                 AS "avgCrimesPerPerson",
      MAX(crime_count)                                           AS "maxCrimesSinglePerson"
    FROM person_deduplication_tracker
  `;

  return result[0];
}
