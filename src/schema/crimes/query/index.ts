// import { GraphQLID, GraphQLInt, GraphQLNonNull } from 'graphql';
// import { getCrime, getCrimes } from '../services';
// import { CrimesType, CrimeType } from '..';

// const CrimeQueryFields = {
//   crime: {
//     type: new GraphQLNonNull(CrimeType),
//     args: {
//       crime_id: { type: new GraphQLNonNull(GraphQLID) },
//     },
//     resolve: async (_root, { crime_id }) => getCrime(crime_id),
//   },
//   crimes: {
//     type: new GraphQLNonNull(CrimesType),
//     args: {
//       cursor: { type: GraphQLID },
//       limit: { type: GraphQLInt },
//     },
//     resolve: async (_root, { cursor, limit }) => {
//       return getCrimes(cursor, limit);
//     },
//   },
// };

// export default CrimeQueryFields;
