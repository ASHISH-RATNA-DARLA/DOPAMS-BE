# Materialized View Reconstruction Analysis

## Executive Summary

This document details the reconstruction of five materialized views from the DOPAMS backend codebase. The reconstruction was performed by analyzing raw database queries found in the backend source code, without using any `.sql` files or migration files.

## Methodology

1. **Code Search**: Located all backend services that reference the materialized views
2. **Query Analysis**: Extracted and analyzed each `prisma.$queryRaw` and `prisma.$queryRawUnsafe` query
3. **Column Mapping**: Identified all columns accessed in SELECT statements, WHERE clauses, and GROUP BY operations
4. **Join Inference**: Determined table relationships from query patterns and backend logic
5. **Aggregation Logic**: Reconstructed JSONB and array aggregations from backend processing patterns

## Backend Services Analyzed

### 1. **Accused Service** (`src/schema/accused/services/index.ts`)
- **Functions**: getAccused, getAccuseds, getAccusedStatistics, getAccusedFilterValues, getAccusedAbstract
- **View Used**: `accuseds_mv`
- **Key Queries**:
  - `SELECT * FROM accuseds_mv WHERE id = $1` (line 215)
  - `SELECT * from accuseds_mv ${whereClause} ${sortClause} ${paginationClause}` (line 235)
  - Multiple GROUP BY queries on gender, state, nationality, caseStatus, etc.
  - Aggregation queries using `JSONB_ARRAY_LENGTH`, `JSONB_ARRAY_ELEMENTS`

### 2. **FIR Service** (`src/schema/firs/services/index.ts`)
- **Functions**: getFir, getFirs, getFirStatistics, getFirFilterValues, getFirsAbstract, getUiPtCasesStatistics
- **View Used**: `firs_mv`
- **Key Queries**:
  - `SELECT * FROM firs_mv WHERE id = $1` (line 262)
  - `SELECT * from firs_mv ${whereClause} ${sortClause} ${paginationClause}` (line 282)
  - Complex aggregation with FILTER clauses for case status and classification (lines 622-635)
  - Joins with `brief_facts_drug` table (line 76)

### 3. **Advanced Search Service** (`src/schema/advanced-search/services/index.ts`)
- **Functions**: advancedSearch, fieldAutocomplete
- **Views Used**: `advanced_search_accuseds_mv`, `advanced_search_firs_mv`
- **Key Queries**:
  - Dynamic SELECT with user-selected fields (line 282)
  - UNION ALL for field autocomplete across multiple views (line 336)
  - Complex WHERE clauses with EXISTS and jsonb_array_elements operations

### 4. **Criminal Profile Service** (`src/schema/criminal-profile/services/index.ts`)
- **Functions**: getCriminalProfile, getCriminalProfiles
- **View Used**: `criminal_profiles_mv`
- **Key Queries**:
  - `SELECT * FROM criminal_profiles_mv WHERE id = $1` (line 43)
  - `SELECT * from criminal_profiles_mv ${whereClause}` (line 88)
  - Name-based filtering on multiple person fields

### 5. **Seizures Service** (`src/schema/firs/services/seizures.ts`)
- **Functions**: getSeizuresFilterValues, getSeizuresStatistics, getSeizuresAbstract
- **View Used**: `firs_mv`
- **Key Queries**:
  - INNER JOIN with `brief_facts_drug` table (line 76, 92, 210)
  - Drug aggregation and normalization (TRIM, UPPER, NULL handling)
  - Quantity and worth calculations

### 6. **Home Service** (`src/schema/home/services/index.ts`)
- **Functions**: getOverallCrimeStats, getCaseStatusClassification, getRegionalOverview, getDrugData, getDrugCases
- **Views Used**: `firs_mv`, `accuseds_mv`
- **Key Queries**:
  - `SELECT id FROM firs_mv` (line 44, 48)
  - `SELECT COUNT(*) FROM accuseds_mv WHERE "crimeId" = ANY($1::text[])` (line 73)
  - Complex CTEs for drug aggregates, accused stats, and crime classifications

## Materialized View Specifications

### VIEW 1: `accuseds_mv`

**Purpose**: Denormalized view of accused records with complete person and crime details

**Base Tables**:
- `accused` (primary)
- `crimes`
- `hierarchy`
- `persons`
- `brief_facts_accused` (for status)
- `brief_facts_drug` (for drug aggregation)

**Key Columns**:
- Crime info: `id`, `unit`, `ps`, `year`, `crimeId`, `crimeRegDate`, `firNumber`
- Accused details: `accusedCode`, `seqNum`, `isCCL`, physical descriptors
- Person details: `name`, `surname`, `age`, address fields, contact info
- Aggregated data: `accusedDetails` (JSONB), `drugType` (array), `drugWithQuantity` (JSONB)

**Used For**:
- Filtering accused by various criteria (name, age, gender, state, nationality, caseStatus)
- Statistical breakdowns by demographics
- Filter value lookups for UI dropdowns
- Hierarchical crime statistics by unit/PS

**Indexes**: id, crimeId, year, unit, ps

---

### VIEW 2: `firs_mv`

**Purpose**: Denormalized view of FIR records with complete crime details and aggregations

**Base Tables**:
- `crimes` (primary)
- `hierarchy`
- `brief_facts_drug`
- `properties`
- `mo_seizures`
- `chargesheets`
- `chargesheet_updates`
- `disposal`
- `interrogation_reports`
- `fsl_case_property`
- `files`

**Key Columns**:
- Crime identifiers: `id`, `firNumber`, `firRegNum`, `firType`
- Location: `unit`, `ps`
- Dates: `crimeRegDate`, `year`
- Case info: `caseStatus`, `caseClassification`, `crimeType`
- Investigation: `ioName`, `ioRank`, `briefFacts`
- Aggregated data: `accusedDetails` (JSONB), `drugType` (array), `drugWithQuantity` (JSONB)
- Related data: `chargesheets`, `disposalDetails`, `irDetails`, `casePropertyDetails` (all JSONB)

**Used For**:
- Finding FIRs by ID, number, status, classification
- Statistical analysis of cases by status, class, crime type
- Filtering and aggregating drug seizures
- Regional overview statistics
- Case statistics broken down by unit/PS/year

**Indexes**: id, year, unit, ps, firNumber, caseStatus, crimeType

---

### VIEW 3: `advanced_search_accuseds_mv`

**Purpose**: Flattened view combining crime, person, and hierarchy data for advanced search on accused records

**Base Tables**:
- `accused` (primary)
- `crimes`
- `hierarchy`
- `persons`
- `brief_facts_accused`
- `brief_facts_drug`

**Key Columns**:
- Accused: `id`, `code`, `type`, `seqNum`, `isCCL`, physical descriptors, `status`
- Crime: `firNum`, `firRegNum`, `firType`, `sections`, `firDate`, `caseStatus`, `caseClass`
- Hierarchy: `psCode`, `psName`, and all hierarchy levels (circle, sdpo, zone, district, ADG)
- Person: `name`, `surname`, `age`, address fields (both present and permanent), contact info
- Drug details: aggregated as JSONB

**Used For**:
- Advanced search with complex filters on any combination of crime/accused/person fields
- Field autocomplete for search inputs
- Dynamic field selection for results

**Indexes**: id, firNum, firDate

---

### VIEW 4: `advanced_search_firs_mv`

**Purpose**: Flattened view combining crime and hierarchy data for advanced search on crime records (no person details)

**Base Tables**:
- `crimes` (primary)
- `hierarchy`
- `brief_facts_drug`

**Key Columns**:
- Crime: `id`, `firNum`, `firRegNum`, `firType`, `sections`, `firDate`, `caseStatus`, `caseClass`
- Hierarchy: `psCode`, `psName`, and all hierarchy levels
- Drug details: aggregated as JSONB

**Used For**:
- Advanced search on crime records without requiring person details
- Reduces query complexity when filtering on crime/location only

**Indexes**: id, firNum, firDate

---

### VIEW 5: `criminal_profiles_mv`

**Purpose**: Denormalized view of person records with aggregated crime, arrest, and drug association statistics

**Base Tables**:
- `persons` (primary)
- `accused`
- `crimes`
- `brief_facts_drug`
- `brief_facts_accused`

**Key Columns**:
- Person: `id`, `name`, `surname`, `age`, address fields, contact info
- Aggregated stats: `noOfCrimes`, `arrestCount`
- Crime history: `latestCrimeId`, `latestCrimeNo`, `previouslyInvolvedCases` (JSONB)
- Drug associations: `associatedDrugs` (array)
- Additional fields: `counselled`, `socialMedia`, `historySheet`, `propertyForfeited`, etc. (mostly NULL)

**Used For**:
- Criminal profile lookups
- Listing criminal profiles with filtering by name
- Sorting by number of crimes or arrest count

**Indexes**: id, fullName, noOfCrimes

---

## Key Query Patterns

### 1. JSONB Array Aggregation
The views use `jsonb_agg()` to aggregate related records:
```sql
SELECT jsonb_agg(jsonb_build_object('name', p.name, 'status', status))
FROM related_table rt
WHERE rt.parent_id = main_table.id
```

### 2. Array Aggregation with FILTER
Drug types are aggregated as text arrays with filtering for non-null values:
```sql
COALESCE(
  ARRAY_AGG(DISTINCT UPPER(TRIM(field))) FILTER (WHERE field IS NOT NULL AND field != 'NO_DRUGS_DETECTED'),
  ARRAY[]::text[]
)
```

### 3. Complex GROUP BY
Many queries perform GROUP BY at different levels (crime, unit, PS, year) with multiple aggregations.

### 4. CROSS JOIN LATERAL
For unnesting arrays and performing lateral operations:
```sql
FROM view_name
CROSS JOIN LATERAL unnest(field) AS t(val)
```

### 5. Conditional Aggregation
Using FILTER clauses to conditionally aggregate based on status values:
```sql
COUNT(*) FILTER (WHERE UPPER(TRIM(field)) = 'VALUE')::int AS conditional_count
```

## Data Consistency Notes

1. **Case Status Normalization**: Some queries normalize case status values (e.g., 'UI' vs 'UNDER INVESTIGATION')
2. **Drug Name Normalization**: Trims and upper-cases drug names to handle inconsistencies
3. **NULL Handling**: Extensively uses COALESCE to provide defaults for missing data
4. **Array Handling**: Defaults to empty arrays `ARRAY[]::text[]` instead of NULL

## Performance Considerations

1. **Indexes on Frequently Filtered Columns**:
   - `id` (primary access pattern)
   - `year`, `caseStatus`, `crimeType` (common filters)
   - `firNumber`, `name` (search patterns)

2. **Materialization Strategy**: These are materialized (not views) because:
   - Repeated aggregations would be expensive if calculated per query
   - Multiple joins across large tables benefit from pre-computed denormalization
   - Complex JSONB aggregations are better pre-computed

3. **Refresh Strategy**: Refresh during off-peak hours or trigger on:
   - Bulk data imports
   - Significant crime/accused/person updates
   - Scheduled daily refresh

## Column Mapping from Backend Code

### accuseds_mv Columns Used in Queries
- **Selection**: All columns via `SELECT *`
- **Filtering**: `id`, `name`, `fullName`, `surname`, `alias`, `emailId`, `unit`, `nationality`, `presentStateUt`, `gender`, `caseStatus`, `caseClassification`, `domicile`, `ps`, `age`, `year`, `drugType`, `accusedStatus`, `accusedType`
- **Grouping**: `gender`, `permanentStateUt`, `nationality`, `accusedType`, `accusedStatus`, `caseStatus`, `caseClassification`, `domicile`, `year`, `unit`, `ps`

### firs_mv Columns Used in Queries
- **Selection**: All columns via `SELECT *`
- **Filtering**: `id`, `firNumber`, `crimeType`, `caseStatus`, `caseClassification`, `unit`, `ps`, `year`, `drugType`
- **Grouping**: `unit`, `ps`, `year`, `caseStatus`, `caseClassification`, `crimeType`

### advanced_search_*_mv Columns Used
All columns are potentially used depending on user-selected filters and fields in the advanced search interface.

## Conclusion

These materialized views provide the denormalization and aggregation necessary for the DOPAMS application's complex querying and reporting requirements. The reconstruction is based on actual backend usage patterns, ensuring that all required columns and aggregations are included.
