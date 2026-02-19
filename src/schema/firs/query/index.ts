import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import SortTypeEnumType from 'schema/misc/enums/sort-type';
import FirSortByEnumType from '../enums/sort-by';

import { FirFilterInputType } from '../filters';

import {
  FirsAbstractType,
  FirsFilterValuesType,
  FirsStatisticsType,
  FirsType,
  FirType,
  OverviewStatisticsType,
  UiPtCasesStatisticsType,
} from '..';
import {
  getFir,
  getFirFilterValues,
  getFirs,
  getFirsAbstract,
  getFirStatistics,
  getOverviewStatistics,
  getUiPtCasesStatistics,
} from '../services';

const FirQueryFields = {
  fir: {
    type: new GraphQLNonNull(FirType),
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: (_root, { id }) => getFir(id),
  },
  firs: {
    type: new GraphQLNonNull(FirsType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      sortKey: { type: FirSortByEnumType, defaultValue: 'crimeRegDate' },
      sortOrder: { type: SortTypeEnumType, defaultValue: 'desc' },
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { page, limit, sortKey, sortOrder, filters }) => getFirs(page, limit, sortKey, sortOrder, filters),
  },
  firStatistics: {
    type: new GraphQLNonNull(FirsStatisticsType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getFirStatistics(filters),
  },
  overviewStatistics: {
    type: new GraphQLNonNull(OverviewStatisticsType),
    resolve: _root => getOverviewStatistics(),
  },
  firFilterValues: {
    type: new GraphQLNonNull(FirsFilterValuesType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getFirFilterValues(filters),
  },
  uiptCasesStatistics: {
    type: new GraphQLNonNull(UiPtCasesStatisticsType),
    args: {
      caseStatus: { type: new GraphQLNonNull(GraphQLString) },
      years: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
      drugTypes: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    },
    resolve: (_root, { caseStatus, years, drugTypes }) => getUiPtCasesStatistics(caseStatus, years, drugTypes),
  },
  firsAbstract: {
    type: new GraphQLNonNull(FirsAbstractType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getFirsAbstract(filters),
  },
};

export default FirQueryFields;
