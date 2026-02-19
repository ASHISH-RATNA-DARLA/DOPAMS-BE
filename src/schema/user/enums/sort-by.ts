import { GraphQLEnumType } from 'graphql';

const UserSortByEnumType = new GraphQLEnumType({
  name: 'UserSortByEnumType',
  values: {
    email: { value: 'email' },
    role: { value: 'role' },
    status: { value: 'status' },
    createdAt: { value: 'createdAt' },
    updatedAt: { value: 'updatedAt' },
  },
});

export default UserSortByEnumType;
