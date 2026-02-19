import { GraphQLEnumType } from 'graphql';

const UserRoleEnumType = new GraphQLEnumType({
  name: 'UserRoleEnumType',
  values: {
    VIEWER: { value: 0 },
    ADMIN: { value: 1 },
  },
});

export default UserRoleEnumType;
