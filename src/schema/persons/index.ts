import { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';

import { sanitizeValue } from 'utils/misc';
import { getCrimesForNetworkPerson } from './services';

// Criminal Network Types (Recursive Structure)
export const NetworkCrimeType = new GraphQLObjectType({
  name: 'NetworkCrimeType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.id),
    },
    firNumber: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.crimeNum),
    },
    firRegNum: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.firRegNum),
    },
    ps: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.hierarchy?.psName ?? crime.psCode),
    },
    date: {
      type: GraphQLString,
      resolve: crime => (crime.firDate ? new Date(crime.firDate).toISOString().split('T')[0] : null),
    },
    sections: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.sections),
    },
    crimeType: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.crimeType),
    },
    briefFacts: {
      type: GraphQLString,
      resolve: crime => sanitizeValue(crime.briefFacts),
    },
    persons: {
      type: new GraphQLList(new GraphQLNonNull(NetworkPersonType)),
      resolve: crime => crime.persons ?? [],
    },
  }),
});

export const NetworkPersonType = new GraphQLObjectType({
  name: 'NetworkPersonType',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.id),
    },
    name: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.name),
    },
    fullName: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.fullName),
    },
    gender: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.gender),
    },
    age: {
      type: GraphQLInt,
      resolve: person => sanitizeValue(person.age),
    },
    relativeName: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.relativeName),
    },
    relationType: {
      type: GraphQLString,
      resolve: person => sanitizeValue(person.relationType),
    },
    crimes: {
      type: new GraphQLList(new GraphQLNonNull(NetworkCrimeType)),
      resolve: async person => {
        if (person.crimes && person.crimes.length > 0) {
          return person.crimes;
        }
        if (person.id) {
          return getCrimesForNetworkPerson(person.id);
        }
        return [];
      },
    },
  }),
});

export const CriminalNetworkDetailsType = NetworkPersonType;
