import { GraphQLEnumType } from 'graphql';

const AdvancedSearchConnectorsEnumType = new GraphQLEnumType({
  name: 'AdvancedSearchConnectorsEnumType',
  values: {
    and: { value: 'and' },
    or: { value: 'or' },
  },
});

export default AdvancedSearchConnectorsEnumType;
