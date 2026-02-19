import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const CriminalProfilesFilterInputType = new GraphQLInputObjectType({
  name: 'CriminalProfilesFilterInputType',
  fields: () => ({
    name: { type: GraphQLString },
  }),
});
