import { GraphQLEnumType } from 'graphql';

const SortTypeEnumType = new GraphQLEnumType({
  name: 'SortTypeEnumType',
  values: {
    ASCENDING: { value: 'asc' },
    DESCENDING: { value: 'desc' },
  },
});

export default SortTypeEnumType;
