import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const StatisticsReturnType = new GraphQLObjectType({
  name: 'StatisticsReturnType',
  fields: () => ({
    label: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: statistics => statistics.label,
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: statistics => statistics.count,
    },
  }),
});

export const StatisticsListType = new GraphQLList(new GraphQLNonNull(StatisticsReturnType));
