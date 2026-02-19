import { prisma } from 'datasources/prisma';
import ResourceNotFoundException from 'utils/errors/resource-not-found';

/**
 * Get complete case history for an accused using deduplication table
 * This shows ALL crimes the person has been involved in, even across duplicate person records
 * Falls back to regular tables if person isn't in deduplication tracker
 *
 * NOTE: This accepts both accused_id AND person_id for flexibility
 */
export async function getAccusedCaseHistory(accusedIdOrPersonId: string) {
  const accusedId = accusedIdOrPersonId;
  // Try deduplication table first (check both accused_ids and person_ids)
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint as "personFingerprint",
      pdt.matching_strategy as "matchingStrategy",
      pdt.matching_tier as "matchingTier",
      CASE 
        WHEN pdt.matching_tier = 1 THEN 'Very High (★★★★★)'
        WHEN pdt.matching_tier = 2 THEN 'High (★★★★☆)'
        WHEN pdt.matching_tier = 3 THEN 'Good (★★★☆☆)'
        WHEN pdt.matching_tier = 4 THEN 'Medium (★★☆☆☆)'
        WHEN pdt.matching_tier = 5 THEN 'Basic (★☆☆☆☆)'
        ELSE 'Unknown'
      END as "confidenceLevel",
      pdt.canonical_person_id as "canonicalPersonId",
      pdt.full_name as "fullName",
      pdt.relative_name as "parentName",
      pdt.age,
      pdt.present_district as district,
      pdt.phone_number as phone,
      pdt.crime_count as "totalCrimes",
      pdt.person_record_count as "totalDuplicateRecords",
      pdt.all_person_ids as "allPersonIds",
      pdt.all_accused_ids as "allAccusedIds",
      pdt.crime_details as "crimeDetails",
      pdt.confidence_score as "confidenceScore"
    FROM person_deduplication_tracker pdt
    WHERE ${accusedId} = ANY(pdt.all_accused_ids)
       OR ${accusedId} = ANY(pdt.all_person_ids)
  `;

  if (result.length > 0) {
    return result[0];
  }

  // FALLBACK: Person not in deduplication tracker (insufficient data)
  // Query regular tables instead (using camelCase aliases to match GraphQL)
  const fallbackResult = await prisma.$queryRaw<any[]>`
    SELECT 
      NULL::TEXT as "personFingerprint",
      'Fallback: Regular Query (insufficient data for deduplication)' as "matchingStrategy",
      NULL::SMALLINT as "matchingTier",
      'Not Available - Insufficient Data' as "confidenceLevel",
      p.person_id as "canonicalPersonId",
      p.full_name as "fullName",
      p.relative_name as "parentName",
      p.age,
      p.present_district as district,
      p.phone_number as phone,
      1 as "totalCrimes",
      1 as "totalDuplicateRecords",
      ARRAY[p.person_id] as "allPersonIds",
      ARRAY[a.accused_id] as "allAccusedIds",
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'crimeId', c.crime_id,
          'accusedId', a.accused_id,
          'firNum', c.fir_num,
          'firRegNum', c.fir_reg_num,
          'firDate', c.fir_date,
          'caseStatus', c.case_status,
          'psName', h.ps_name,
          'distName', h.dist_name,
          'accusedCode', a.accused_code,
          'accusedType', bfa.accused_type,
          'accusedStatus', bfa.status
        )
      ) as "crimeDetails",
      NULL::NUMERIC as "confidenceScore"
    FROM accused a
    JOIN persons p ON a.person_id = p.person_id
    JOIN crimes c ON a.crime_id = c.crime_id
    LEFT JOIN hierarchy h ON c.ps_code = h.ps_code
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
 * Get case history by person ID
 */
export async function getPersonCaseHistory(personId: string) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint,
      pdt.matching_strategy,
      pdt.matching_tier,
      CASE 
        WHEN pdt.matching_tier = 1 THEN 'Very High'
        WHEN pdt.matching_tier = 2 THEN 'High'
        WHEN pdt.matching_tier = 3 THEN 'Good'
        WHEN pdt.matching_tier = 4 THEN 'Medium'
        WHEN pdt.matching_tier = 5 THEN 'Basic'
      END as confidence_level,
      pdt.canonical_person_id,
      pdt.full_name,
      pdt.relative_name as parent_name,
      pdt.age,
      pdt.present_district as district,
      pdt.phone_number as phone,
      pdt.all_person_ids,
      pdt.all_accused_ids,
      pdt.crime_count as total_crimes,
      pdt.person_record_count as total_duplicate_records,
      pdt.crime_details
    FROM person_deduplication_tracker pdt
    WHERE ${personId} = ANY(pdt.all_person_ids)
  `;

  if (result.length === 0) {
    throw new ResourceNotFoundException('Person not found in deduplication tracker');
  }

  return result[0];
}

/**
 * Search persons by name
 */
export async function searchPersonsByName(searchName: string) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint,
      pdt.matching_strategy,
      pdt.full_name,
      pdt.relative_name as parent_name,
      pdt.age,
      pdt.present_district as district,
      pdt.phone_number as phone,
      pdt.crime_count as total_crimes,
      pdt.person_record_count as total_duplicate_records
    FROM person_deduplication_tracker pdt
    WHERE LOWER(pdt.full_name) LIKE LOWER(${'%' + searchName + '%'})
    ORDER BY pdt.crime_count DESC, pdt.full_name ASC
    LIMIT 50
  `;

  return result;
}

/**
 * Get statistics about deduplication
 */
export async function getDeduplicationStatistics() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_unique_persons,
      SUM(person_record_count) as total_person_records,
      SUM(person_record_count) - COUNT(*) as duplicate_records_found,
      COUNT(*) FILTER (WHERE person_record_count > 1) as persons_with_duplicates,
      COUNT(*) FILTER (WHERE crime_count > 1) as repeat_offenders,
      ROUND(AVG(crime_count), 2) as avg_crimes_per_person,
      MAX(crime_count) as max_crimes_single_person
    FROM person_deduplication_tracker
  `;

  return result[0];
}
