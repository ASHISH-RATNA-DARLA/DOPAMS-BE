import { GraphQLInputObjectType, GraphQLInt, GraphQLString } from 'graphql';

export const IntRangeType = new GraphQLInputObjectType({
  name: 'IntRangeType',
  fields: () => ({
    from: { type: GraphQLInt },
    to: { type: GraphQLInt },
  }),
});

export const StringRangeType = new GraphQLInputObjectType({
  name: 'StringRangeType',
  fields: () => ({
    from: { type: GraphQLString },
    to: { type: GraphQLString },
  }),
});
