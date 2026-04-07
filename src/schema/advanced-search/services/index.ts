import { Prisma } from '@prisma/client';
import { prisma } from 'datasources/prisma';
import { AdvancedSearch, FirAdvancedFilterInput } from 'interfaces/advanced-search';
import { PageNumberPaginationMeta } from 'prisma-extension-pagination';

// ─────────────────────────────────────────────────────────────────────────────
// TABLE TYPE
// ─────────────────────────────────────────────────────────────────────────────
// 'crimes'  → advanced_search_firs_mv       (no accused/person join)
// 'accused' → advanced_search_accuseds_mv   (includes accused + persons join)
// 'persons' → advanced_search_accuseds_mv   (includes accused + persons join)
// 'hierarchy' → both MVs already embed hierarchy columns
// ─────────────────────────────────────────────────────────────────────────────
type Tables = 'crimes' | 'accused' | 'hierarchy' | 'persons';

// ─────────────────────────────────────────────────────────────────────────────
// FIELD MAP
//
// Rules derived from the two materialized views in DB:
//
//   advanced_search_firs_mv      — crimes ⋈ hierarchy + drugDetails JSONB subquery
//   advanced_search_accuseds_mv  — accused ⋈ crimes ⋈ hierarchy ⋈ persons(LEFT) ⋈ brief_facts_accused(LEFT)
//
// Key schema changes vs. old service:
//
//  1. accused.seq_num     (snake_case) → MV alias "seqNum"
//     accused.is_ccl      (snake_case) → MV alias "isCCL"
//     accused.accused_code→ MV alias "accusedCode"
//
//  2. accusedType  → in MV it is COALESCE(bfa.accused_type, a.type) AS "accusedRole"
//     accusedStatus → in MV it is computed CASE ... END AS "accusedStatus"
//     Table assignment stays 'accused' so the accuseds MV is chosen.
//
//  3. domicile → persons.domicile_classification aliased as "domicile" in MV.
//     Column name in the MV is "domicile" — unchanged.
//
//  4. stipulatedPeriodForCS → computed CASE expression in both MVs, aliased as
//     "stipulatedPeriodForCS". It is a text column in the MV output — treat it
//     as a plain text column on the crimes table (firs MV has it too).
//
//  5. Drug fields → brief_facts_drug is aggregated into the JSONB column
//     "drugDetails" inside both MVs. The jsonPath approach is correct.
//     Table is 'crimes' so firs MV is used (drugs don't require accused join).
//     The MV definition for drugDetails uses 'quantity' (string) instead of
//     granular numeric fields (quantityKg, quantityMl, quantityCount).
//
//  6. presentAddress / permanentAddress → computed concat_ws columns in
//     accuseds MV. They exist only in the accuseds MV, so table = 'persons'.
//
//  7. hierarchy fields exist in BOTH MVs (joined in both). We keep table =
//     'hierarchy' and detect that they're available in both views (see
//     view selection logic in advancedSearch).
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_MAP: Record<keyof AdvancedSearch, { base: string; table: Tables; jsonPath?: string; cast?: string }> = {
  // ── crimes table (available in both MVs) ──────────────────────────────────
  id: { base: '"id"', table: 'crimes' },
  psCode: { base: '"psCode"', table: 'crimes' },
  firNum: { base: '"firNum"', table: 'crimes' },
  firRegNum: { base: '"firRegNum"', table: 'crimes' },
  firType: { base: '"firType"', table: 'crimes' },
  sections: { base: '"sections"', table: 'crimes' },
  // firDate: stored as timestamp in DB, cast to date for date comparisons
  firDate: { base: '"firDate"', table: 'crimes', cast: 'date' },
  caseStatus: { base: '"caseStatus"', table: 'crimes' },
  // caseClass maps to crimes.class_classification → aliased "caseClass" in MVs
  caseClass: { base: '"caseClass"', table: 'crimes' },
  majorHead: { base: '"majorHead"', table: 'crimes' },
  minorHead: { base: '"minorHead"', table: 'crimes' },
  crimeType: { base: '"crimeType"', table: 'crimes' },
  ioName: { base: '"ioName"', table: 'crimes' },
  ioRank: { base: '"ioRank"', table: 'crimes' },
  briefFacts: { base: '"briefFacts"', table: 'crimes' },
  // stipulatedPeriodForCS is a computed CASE expression in both MVs,
  // aliased as "stipulatedPeriodForCS" — treat as plain text in MV output.
  stipulatedPeriodForCS: { base: '"stipulatedPeriodForCS"', table: 'crimes' },

  // ── drug fields (brief_facts_drug aggregated into "drugDetails" JSONB) ────
  // These use the firs MV (table: 'crimes') since drug info doesn't need accused.
  // jsonPath keys match the jsonb_build_object keys in the MV definition:
  //   'name', 'quantityKg', 'quantityMl', 'quantityCount', 'worth'
  drugType: { base: '"drugDetails"', jsonPath: "'name'", table: 'crimes' },
  drugQuantityKg: { base: '"drugDetails"', jsonPath: "'quantity'", table: 'crimes', cast: 'text' },
  drugQuantityMl: { base: '"drugDetails"', jsonPath: "'quantity'", table: 'crimes', cast: 'text' },
  drugQuantityCount: { base: '"drugDetails"', jsonPath: "'quantity'", table: 'crimes', cast: 'text' },
  drugWorth: { base: '"drugDetails"', jsonPath: "'worth'", table: 'crimes', cast: 'numeric' },

  // ── hierarchy table (embedded in both MVs via JOIN) ───────────────────────
  // Using table: 'hierarchy' as a sentinel. The view-selection logic below
  // treats 'hierarchy' as available in both MVs, so it falls back to firs MV
  // unless another field forces the accuseds MV.
  psName: { base: '"psName"', table: 'hierarchy' },
  circleCode: { base: '"circleCode"', table: 'hierarchy' },
  circleName: { base: '"circleName"', table: 'hierarchy' },
  sdpoCode: { base: '"sdpoCode"', table: 'hierarchy' },
  sdpoName: { base: '"sdpoName"', table: 'hierarchy' },
  subZoneCode: { base: '"subZoneCode"', table: 'hierarchy' },
  subZoneName: { base: '"subZoneName"', table: 'hierarchy' },
  distCode: { base: '"distCode"', table: 'hierarchy' },
  distName: { base: '"distName"', table: 'hierarchy' },
  rangeCode: { base: '"rangeCode"', table: 'hierarchy' },
  rangeName: { base: '"rangeName"', table: 'hierarchy' },
  zoneCode: { base: '"zoneCode"', table: 'hierarchy' },
  zoneName: { base: '"zoneName"', table: 'hierarchy' },
  adgCode: { base: '"adgCode"', table: 'hierarchy' },
  adgName: { base: '"adgName"', table: 'hierarchy' },

  // ── accused table (accuseds MV only) ─────────────────────────────────────
  // DB columns: accused_code, type, seq_num, is_ccl, physical features
  // All aliased to camelCase in the MV.
  accusedCode: { base: '"accusedCode"', table: 'accused' },
  // 'type' is the raw accused.type column (aliased as "type" in MV)
  type: { base: '"type"', table: 'accused' },
  seqNum: { base: '"seqNum"', table: 'accused' },
  isCCL: { base: '"isCCL"', table: 'accused', cast: 'boolean' },
  beard: { base: '"beard"', table: 'accused' },
  build: { base: '"build"', table: 'accused' },
  color: { base: '"color"', table: 'accused' },
  ear: { base: '"ear"', table: 'accused' },
  eyes: { base: '"eyes"', table: 'accused' },
  face: { base: '"face"', table: 'accused' },
  hair: { base: '"hair"', table: 'accused' },
  height: { base: '"height"', table: 'accused' },
  leucoderma: { base: '"leucoderma"', table: 'accused' },
  mole: { base: '"mole"', table: 'accused' },
  mustache: { base: '"mustache"', table: 'accused' },
  nose: { base: '"nose"', table: 'accused' },
  teeth: { base: '"teeth"', table: 'accused' },
  // accusedType → MV: a.type AS "accusedType" (same underlying column as type)
  accusedType: { base: '"accusedRole"', table: 'accused' },
  // accusedStatus → MV: COALESCE(bfa.status, a.accused_status) AS "accusedStatus"
  accusedStatus: { base: '"accusedStatus"', table: 'accused' },

  // ── persons table (accuseds MV only, LEFT JOIN) ───────────────────────────
  // DB columns use snake_case; all aliased to camelCase in the MV.
  name: { base: '"name"', table: 'persons' },
  surname: { base: '"surname"', table: 'persons' },
  alias: { base: '"alias"', table: 'persons' },
  fullName: { base: '"fullName"', table: 'persons' },
  relationType: { base: '"relationType"', table: 'persons' },
  relativeName: { base: '"relativeName"', table: 'persons' },
  gender: { base: '"gender"', table: 'persons' },
  isDied: { base: '"isDied"', table: 'persons', cast: 'boolean' },
  // dateOfBirth: DB column is date type; cast to timestamp for range queries
  dateOfBirth: { base: '"dateOfBirth"', table: 'persons', cast: 'timestamp' },
  // age: DB column is integer
  age: { base: '"age"', table: 'persons', cast: 'integer' },
  occupation: { base: '"occupation"', table: 'persons' },
  educationQualification: { base: '"educationQualification"', table: 'persons' },
  caste: { base: '"caste"', table: 'persons' },
  subCaste: { base: '"subCaste"', table: 'persons' },
  religion: { base: '"religion"', table: 'persons' },
  // domicile → persons.domicile_classification aliased as "domicile" in MV
  domicile: { base: '"domicile"', table: 'persons' },
  nationality: { base: '"nationality"', table: 'persons' },
  designation: { base: '"designation"', table: 'persons' },
  placeOfWork: { base: '"placeOfWork"', table: 'persons' },
  presentHouseNo: { base: '"presentHouseNo"', table: 'persons' },
  presentStreetRoadNo: { base: '"presentStreetRoadNo"', table: 'persons' },
  presentWardColony: { base: '"presentWardColony"', table: 'persons' },
  presentLandmarkMilestone: { base: '"presentLandmarkMilestone"', table: 'persons' },
  presentLocalityVillage: { base: '"presentLocalityVillage"', table: 'persons' },
  presentAreaMandal: { base: '"presentAreaMandal"', table: 'persons' },
  presentDistrict: { base: '"presentDistrict"', table: 'persons' },
  presentStateUt: { base: '"presentStateUt"', table: 'persons' },
  presentCountry: { base: '"presentCountry"', table: 'persons' },
  presentResidencyType: { base: '"presentResidencyType"', table: 'persons' },
  presentPinCode: { base: '"presentPinCode"', table: 'persons' },
  presentJurisdictionPs: { base: '"presentJurisdictionPs"', table: 'persons' },
  // presentAddress / permanentAddress are computed concat_ws columns in the
  // accuseds MV — they don't exist in the firs MV.
  presentAddress: { base: '"presentAddress"', table: 'persons' },
  permanentHouseNo: { base: '"permanentHouseNo"', table: 'persons' },
  permanentStreetRoadNo: { base: '"permanentStreetRoadNo"', table: 'persons' },
  permanentWardColony: { base: '"permanentWardColony"', table: 'persons' },
  permanentLandmarkMilestone: { base: '"permanentLandmarkMilestone"', table: 'persons' },
  permanentLocalityVillage: { base: '"permanentLocalityVillage"', table: 'persons' },
  permanentAreaMandal: { base: '"permanentAreaMandal"', table: 'persons' },
  permanentDistrict: { base: '"permanentDistrict"', table: 'persons' },
  permanentStateUt: { base: '"permanentStateUt"', table: 'persons' },
  permanentCountry: { base: '"permanentCountry"', table: 'persons' },
  permanentResidencyType: { base: '"permanentResidencyType"', table: 'persons' },
  permanentPinCode: { base: '"permanentPinCode"', table: 'persons' },
  permanentJurisdictionPs: { base: '"permanentJurisdictionPs"', table: 'persons' },
  permanentAddress: { base: '"permanentAddress"', table: 'persons' },
  phoneNumber: { base: '"phoneNumber"', table: 'persons' },
  countryCode: { base: '"countryCode"', table: 'persons' },
  emailId: { base: '"emailId"', table: 'persons' },
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW SELECTION
//
// Only 'accused' and 'persons' fields require the accuseds MV.
// 'crimes', 'hierarchy', and 'drugs' (table: 'crimes') are satisfied by
// the lighter firs MV.
// ─────────────────────────────────────────────────────────────────────────────
function requiresAccusedsView(table: Tables): boolean {
  return table === 'accused' || table === 'persons';
}

function selectView(fields: (keyof AdvancedSearch)[]): string {
  const needsAccused = fields.some(f => requiresAccusedsView(FIELD_MAP[f]?.table));
  return needsAccused ? 'advanced_search_accuseds_mv' : 'advanced_search_firs_mv';
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATOR MAP
// ─────────────────────────────────────────────────────────────────────────────
const sqlOpMap: Record<FirAdvancedFilterInput['operator'], string> = {
  equals: '=',
  contains: 'ILIKE',
  startsWith: 'ILIKE',
  endsWith: 'ILIKE',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  between: 'BETWEEN',
};

// ─────────────────────────────────────────────────────────────────────────────
// CONDITION BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildCondition(f: FirAdvancedFilterInput, params: any[], paramIndex: number) {
  const { field, operator, value, value2 } = f;
  const info = FIELD_MAP[field as keyof AdvancedSearch];
  if (!info) throw new Error(`Unknown field: ${field}`);

  const sqlOp = sqlOpMap[operator];
  if (!sqlOp) throw new Error(`Unsupported operator: ${operator}`);

  // Default cast type for comparisons — use 'text' unless the field has a
  // specific cast (e.g. 'date', 'integer', 'numeric', 'boolean').
  const sqlType = info.cast ?? 'text';

  // ── BETWEEN ───────────────────────────────────────────────────────────────
  if (operator === 'between') {
    params.push(value, value2);
    const p1 = `CAST($${paramIndex} AS ${sqlType})`;
    const p2 = `CAST($${paramIndex + 1} AS ${sqlType})`;

    if (info.jsonPath) {
      // JSONB array field (drug details)
      return {
        condition: `
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(${info.base}) AS elem
            WHERE CAST(elem->>${info.jsonPath} AS ${sqlType}) BETWEEN ${p1} AND ${p2}
          )
        `,
        nextIndex: paramIndex + 2,
      };
    }

    return {
      condition: `${info.base}::${sqlType} BETWEEN ${p1} AND ${p2}`,
      nextIndex: paramIndex + 2,
    };
  }

  // ── ILIKE operators (contains / startsWith / endsWith) ────────────────────
  if (operator === 'contains' || operator === 'startsWith' || operator === 'endsWith') {
    let valPattern = value;
    if (operator === 'contains') valPattern = `%${value}%`;
    if (operator === 'startsWith') valPattern = `${value}%`;
    if (operator === 'endsWith') valPattern = `%${value}`;

    params.push(valPattern);
    const p1 = `$${paramIndex}`;

    if (info.jsonPath) {
      return {
        condition: `
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(${info.base}) AS elem
            WHERE (elem->>${info.jsonPath}) ILIKE ${p1}
          )
        `,
        nextIndex: paramIndex + 1,
      };
    }

    // For ILIKE we do NOT cast — keeps it as text comparison which ILIKE expects.
    return {
      condition: `${info.base}::text ${sqlOp} ${p1}`,
      nextIndex: paramIndex + 1,
    };
  }

  // ── All other operators (equals, gt, gte, lt, lte) ────────────────────────
  params.push(value);

  if (info.jsonPath) {
    if (operator === 'equals' && sqlType === 'text') {
      return {
        condition: `
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(${info.base}) AS elem
            WHERE UPPER(TRIM(CAST(elem->>${info.jsonPath} AS text))) = UPPER(TRIM($${paramIndex}::text))
          )
        `,
        nextIndex: paramIndex + 1,
      };
    }

    const p1 = `CAST($${paramIndex} AS ${sqlType})`;
    return {
      condition: `
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(${info.base}) AS elem
          WHERE CAST(elem->>${info.jsonPath} AS ${sqlType}) ${sqlOp} ${p1}
        )
      `,
      nextIndex: paramIndex + 1,
    };
  }

  if (operator === 'equals' && sqlType === 'text') {
    return {
      condition: `UPPER(TRIM(${info.base}::text)) = UPPER(TRIM($${paramIndex}::text))`,
      nextIndex: paramIndex + 1,
    };
  }

  const p1 = `CAST($${paramIndex} AS ${sqlType})`;
  return {
    condition: `${info.base}::${sqlType} ${sqlOp} ${p1}`,
    nextIndex: paramIndex + 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BUILDER
// ─────────────────────────────────────────────────────────────────────────────
export function buildFilters(filters: FirAdvancedFilterInput[]) {
  const params: any[] = [];
  const clauses: string[] = [];
  let paramIndex = 1;

  for (const f of filters) {
    const { condition, nextIndex } = buildCondition(f, params, paramIndex);
    paramIndex = nextIndex;
    clauses.push(condition);
  }

  // Combine clauses with AND/OR connectors from each filter
  const combined = filters.reduce((acc, f, i) => {
    const connector = f.connector?.toUpperCase() ?? 'AND';
    return i === 0 ? clauses[i] : `${acc} ${connector} ${clauses[i]}`;
  }, '');

  return {
    whereClause: combined ? `WHERE ${combined}` : '',
    params,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT BUILDER
// Wraps each camelCase alias in double-quotes so PostgreSQL finds them.
// Falls back to * when no fields specified.
// ─────────────────────────────────────────────────────────────────────────────
function buildSelect(selectedFields: (keyof AdvancedSearch)[]): string {
  if (!selectedFields || selectedFields.length === 0) return '*';
  return selectedFields.map(f => `"${f}"`).join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildSorting(sortKey: keyof AdvancedSearch = 'firDate', sortOrder: Prisma.SortOrder = 'desc'): string {
  const safeSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${sortKey}" ${safeSortOrder} NULLS LAST`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildPagination(page: number = 1, limit: number = 100): string {
  if (limit === -1) return ''; // fetch all
  const safePage = Math.max(page, 1);
  const safeLimit = Math.max(limit, 1);
  const offset = (safePage - 1) * safeLimit;
  return `LIMIT ${safeLimit} OFFSET ${offset}`;
}

function buildPageInfo(page: number, limit: number, totalCount: number): PageNumberPaginationMeta<true> {
  const pageCount = limit === -1 ? 1 : Math.ceil(totalCount / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < pageCount ? page + 1 : null;

  return {
    isFirstPage: previousPage === null,
    isLastPage: nextPage === null,
    currentPage: page,
    previousPage,
    nextPage,
    pageCount,
    totalCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED SEARCH
// ─────────────────────────────────────────────────────────────────────────────
export async function advancedSearch(
  page: number = 1,
  limit: number = 100,
  sortKey: keyof AdvancedSearch = 'firDate',
  sortOrder: Prisma.SortOrder = 'desc',
  filters: FirAdvancedFilterInput[] = [],
  selectedFields: (keyof AdvancedSearch)[] = []
) {
  // Determine which MV to use based on the union of selected + filtered + sorted fields.
  const allReferencedFields: (keyof AdvancedSearch)[] = [
    ...selectedFields,
    ...filters.map(f => f.field as keyof AdvancedSearch),
    sortKey,
  ];
  const view = selectView(allReferencedFields);

  const selectClause = buildSelect(selectedFields);
  const sortClause = buildSorting(sortKey, sortOrder);
  const paginationClause = buildPagination(page, limit);
  const { whereClause, params } = buildFilters(filters);

  const [nodes, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<AdvancedSearch[]>(
      `SELECT ${selectClause} FROM ${view} ${whereClause} ${sortClause} ${paginationClause};`,
      ...params
    ),
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(DISTINCT id)::int AS count FROM ${view} ${whereClause};`,
      ...params
    ),
  ]);

  const pageInfo = buildPageInfo(page, limit, countResult[0].count);
  return { nodes, pageInfo };
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD AUTOCOMPLETE
// ─────────────────────────────────────────────────────────────────────────────
type FieldAutocompleteResult = { field: keyof AdvancedSearch; value: string };

export async function fieldAutocomplete(
  fields: (keyof AdvancedSearch)[],
  input: string
): Promise<FieldAutocompleteResult[]> {
  const uniqueFields = Array.from(new Set(fields ?? []));
  if (uniqueFields.length === 0) return [];

  const search = input?.trim();
  if (!search) return [];

  const likeParam = `%${search}%`;

  const selectStatements = uniqueFields.map(field => {
    const info = FIELD_MAP[field];
    if (!info) throw new Error(`Unknown field: ${field}`);

    const view = requiresAccusedsView(info.table) ? 'advanced_search_accuseds_mv' : 'advanced_search_firs_mv';

    if (info.jsonPath) {
      // JSONB array field — unnest and search inside each element
      return `
        SELECT DISTINCT '${field}' AS field, (elem->>${info.jsonPath})::text AS value
        FROM ${view}
        CROSS JOIN LATERAL jsonb_array_elements(${info.base}) AS elem
        WHERE (elem->>${info.jsonPath})::text ILIKE $1
          AND elem->>${info.jsonPath} IS NOT NULL
      `;
    }

    return `
      SELECT DISTINCT '${field}' AS field, (${info.base})::text AS value
      FROM ${view}
      WHERE (${info.base})::text ILIKE $1
        AND ${info.base} IS NOT NULL
    `;
  });

  const unionQuery = selectStatements.join('\nUNION ALL\n');
  const query = `
    SELECT field, value
    FROM (${unionQuery}) AS combined
    WHERE value IS NOT NULL AND value <> ''
    LIMIT 50
  `;

  const rows = await prisma.$queryRawUnsafe<{ field: string; value: string }[]>(query, likeParam);

  return rows
    .filter(row => Boolean(row.value?.trim()))
    .map(row => ({ field: row.field as keyof AdvancedSearch, value: row.value }));
}
