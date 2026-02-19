import { GraphQLEnumType } from 'graphql';

const StatusEnumType = new GraphQLEnumType({
  name: 'StatusEnumType',
  values: {
    INACTIVE: { value: 0 },
    ACTIVE: { value: 1 },
  },
});

export default StatusEnumType;
