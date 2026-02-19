import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } from 'graphql';

// Individual crime record in the history
export const CrimeHistoryRecordType = new GraphQLObjectType({
  name: 'CrimeHistoryRecord',
  description: 'Individual crime record for an accused person',
  fields: () => ({
    crimeId: {
      type: GraphQLString,
      description: 'Unique crime ID',
    },
    accusedId: {
      type: GraphQLString,
      description: 'Accused ID for this crime',
    },
    firNum: {
      type: GraphQLString,
      description: 'FIR number',
    },
    firRegNum: {
      type: GraphQLString,
      description: 'FIR registration number',
    },
    firDate: {
      type: GraphQLString,
      description: 'FIR date (ISO format)',
    },
    caseStatus: {
      type: GraphQLString,
      description: 'Current case status',
    },
    psName: {
      type: GraphQLString,
      description: 'Police station name',
    },
    distName: {
      type: GraphQLString,
      description: 'District name',
    },
    accusedCode: {
      type: GraphQLString,
      description: 'Accused code (A1, A2, etc.)',
    },
    accusedType: {
      type: GraphQLString,
      description: 'Type of accused (Main Accused, Co-Accused, etc.)',
    },
    accusedStatus: {
      type: GraphQLString,
      description: 'Accused status',
    },
    matchingStrategy: {
      type: GraphQLString,
      description: 'Matching strategy used to identify this person (e.g., Name + Parent + District + Age)',
    },
    confidenceLevel: {
      type: GraphQLString,
      description: 'Confidence level of the match (Very High, High, Good, Medium, Basic)',
    },
    matchingTier: {
      type: GraphQLInt,
      description: 'Matching tier (1-5, lower is better)',
    },
  }),
});

// Main case history type returned for an accused
export const AccusedCaseHistoryType = new GraphQLObjectType({
  name: 'AccusedCaseHistory',
  description: 'Complete case history for an accused person with deduplication info',
  fields: () => ({
    personFingerprint: {
      type: GraphQLString,
      description: 'Unique person fingerprint (MD5 hash) - null if person not in deduplication tracker',
    },
    matchingStrategy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Matching strategy used (e.g., Name + Parent + District + Age)',
    },
    matchingTier: {
      type: GraphQLInt,
      description: 'Matching tier (1-5, lower is better) - null if fallback used',
    },
    confidenceLevel: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Confidence level (Very High, High, Good, Medium, Basic, or Not Available)',
    },
    canonicalPersonId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Primary person ID (earliest record)',
    },
    fullName: {
      type: GraphQLString,
      description: 'Full name of the person',
    },
    parentName: {
      type: GraphQLString,
      description: 'Parent/relative name',
    },
    age: {
      type: GraphQLInt,
      description: 'Age',
    },
    district: {
      type: GraphQLString,
      description: 'District',
    },
    phone: {
      type: GraphQLString,
      description: 'Phone number',
    },
    totalCrimes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of crimes across all records',
    },
    totalDuplicateRecords: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of duplicate person records found',
    },
    allPersonIds: {
      type: new GraphQLList(GraphQLString),
      description: 'All person IDs that belong to this individual',
    },
    allAccusedIds: {
      type: new GraphQLList(GraphQLString),
      description: 'All accused IDs across all crimes',
    },
    crimeHistory: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimeHistoryRecordType))),
      description: 'Complete list of all crimes',
      resolve: parent => {
        // Parse the JSONB crimeDetails field and transform snake_case to camelCase
        if (parent.crimeDetails) {
          try {
            const crimes =
              typeof parent.crimeDetails === 'string' ? JSON.parse(parent.crimeDetails) : parent.crimeDetails;

            // Transform snake_case to camelCase for each crime record
            // Also include matching strategy from parent context
            return crimes.map((crime: any) => ({
              crimeId: crime.crime_id || crime.crimeId,
              accusedId: crime.accused_id || crime.accusedId,
              firNum: crime.fir_num || crime.firNum,
              firRegNum: crime.fir_reg_num || crime.firRegNum,
              firDate: crime.fir_date || crime.firDate,
              caseStatus: crime.case_status || crime.caseStatus,
              psName: crime.ps_name || crime.psName,
              distName: crime.dist_name || crime.distName,
              accusedCode: crime.accused_code || crime.accusedCode,
              accusedType: crime.accused_type || crime.accusedType,
              accusedStatus: crime.accused_status || crime.accusedStatus,
              // Add matching information from parent context
              matchingStrategy: parent.matchingStrategy,
              confidenceLevel: parent.confidenceLevel,
              matchingTier: parent.matchingTier,
            }));
          } catch (e) {
            console.error('Error parsing crimeDetails:', e);
            return [];
          }
        }
        return [];
      },
    },
    isDuplicate: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Whether this person has duplicate records (YES/NO)',
      resolve: parent => (parent.totalDuplicateRecords > 1 ? 'YES' : 'NO'),
    },
    confidenceScore: {
      type: GraphQLString,
      description: 'Numerical confidence score (0-1)',
    },
  }),
});

// Search result type for finding persons by name
export const PersonSearchResultType = new GraphQLObjectType({
  name: 'PersonSearchResult',
  description: 'Search result for finding persons by name',
  fields: () => ({
    personFingerprint: {
      type: new GraphQLNonNull(GraphQLString),
    },
    matchingStrategy: {
      type: GraphQLString,
    },
    fullName: {
      type: GraphQLString,
    },
    parentName: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    },
    district: {
      type: GraphQLString,
    },
    phone: {
      type: GraphQLString,
    },
    totalCrimes: {
      type: GraphQLInt,
    },
    totalDuplicateRecords: {
      type: GraphQLInt,
    },
  }),
});
