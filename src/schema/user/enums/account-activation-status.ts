import { GraphQLEnumType } from 'graphql';

const AccountActivationStatusEnumType = new GraphQLEnumType({
  name: 'AccountActivationStatusEnumType',
  values: {
    INACTIVE: { value: 0 },
    ACTIVE: { value: 1 },
    EXPIRED: { value: 2 },
  },
});

export default AccountActivationStatusEnumType;
