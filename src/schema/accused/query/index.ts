import { GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

import AccusedSortByEnumType from '../enum/sort-by';
import SortTypeEnumType from 'schema/misc/enums/sort-type';

import { AccusedType, AccusedsType, AccusedStatisticsType, AccusedFilterValuesType, AccusedAbstractType } from '..';
import { getAccused, getAccuseds, getAccusedStatistics, getAccusedFilterValues, getAccusedAbstract } from '../services';
import { AccusedFilterInputType } from '../filters';

const AccusedQueryFields = {
  accused: {
    type: new GraphQLNonNull(AccusedType),
    args: {
      accusedId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root, { accusedId }) => getAccused(accusedId),
  },
  accuseds: {
    type: new GraphQLNonNull(AccusedsType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      sortKey: { type: AccusedSortByEnumType, defaultValue: 'crimeRegDate' },
      sortOrder: { type: SortTypeEnumType, defaultValue: 'desc' },
      filters: { type: AccusedFilterInputType },
    },
    resolve: (_root, { page, limit, sortKey, sortOrder, filters }) =>
      getAccuseds(page, limit, sortKey, sortOrder, filters),
  },
  accusedStatistics: {
    type: new GraphQLNonNull(AccusedStatisticsType),
    args: {
      filters: { type: AccusedFilterInputType },
    },
    resolve: (_root, { filters }) => getAccusedStatistics(filters),
  },
  accusedFilterValues: {
    type: new GraphQLNonNull(AccusedFilterValuesType),
    args: {
      filters: { type: AccusedFilterInputType },
    },
    resolve: (_root, { filters }) => getAccusedFilterValues(filters),
  },
  accusedAbstract: {
    type: new GraphQLNonNull(AccusedAbstractType),
    args: {
      filters: { type: AccusedFilterInputType },
    },
    resolve: (_root, { filters }) => getAccusedAbstract(filters),
  },
};

export default AccusedQueryFields;
