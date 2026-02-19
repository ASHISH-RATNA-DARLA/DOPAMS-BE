import { GraphQLEnumType } from 'graphql';

const AdvancedSearchOperatorsEnumType = new GraphQLEnumType({
  name: 'AdvancedSearchOperatorsEnumType',
  values: {
    equals: { value: 'equals' },
    gte: { value: 'gte' },
    gt: { value: 'gt' },
    lte: { value: 'lte' },
    lt: { value: 'lt' },
    contains: { value: 'contains' },
    between: { value: 'between' },
    startsWith: { value: 'startsWith' },
    endsWith: { value: 'endsWith' },
  },
});

export default AdvancedSearchOperatorsEnumType;
