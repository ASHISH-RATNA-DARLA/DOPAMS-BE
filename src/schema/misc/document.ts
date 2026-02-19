import { GraphQLObjectType, GraphQLString } from 'graphql';

export const DocumentType = new GraphQLObjectType({
  name: 'DocumentType',
  fields: () => ({
    name: { type: GraphQLString },
    link: { type: GraphQLString },
  }),
});
