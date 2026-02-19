import { GraphQLNonNull } from 'graphql';

import { FirFilterInputType } from '../filters';

import { SeizuresAbstractType, SeizuresFilterValuesType, SeizuresStatisticsType } from '../seizures';
import { getSeizuresAbstract, getSeizuresFilterValues, getSeizuresStatistics } from '../services/seizures';

const SeizuresQueryFields = {
  seizureStatistics: {
    type: new GraphQLNonNull(SeizuresStatisticsType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getSeizuresStatistics(filters),
  },
  seizuresFilterValues: {
    type: new GraphQLNonNull(SeizuresFilterValuesType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getSeizuresFilterValues(filters),
  },
  seizuresAbstract: {
    type: new GraphQLNonNull(SeizuresAbstractType),
    args: {
      filters: { type: FirFilterInputType },
    },
    resolve: (_root, { filters }) => getSeizuresAbstract(filters),
  },
};

export default SeizuresQueryFields;
