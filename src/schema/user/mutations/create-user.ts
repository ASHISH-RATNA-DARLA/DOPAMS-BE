import { GraphQLNonNull, GraphQLString } from 'graphql';

import { UserType } from '..';
import { createUser } from '../services';

import UserRoleEnumType from '../enums/user-role';

const CreateUser = {
  type: UserType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(UserRoleEnumType) },
  },
  resolve: async (_root, { email, password, role }) => {
    return createUser(email, password, role);
  },
};

export default CreateUser;
