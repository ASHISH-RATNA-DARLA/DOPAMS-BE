import { GraphQLID, GraphQLNonNull } from 'graphql';

import { updateUserRole } from '../services';

import { UserType } from 'schema/user';
import RoleEnumType from 'schema/user/enums/user-role';

const UpdateUserRole = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    role: { type: new GraphQLNonNull(RoleEnumType) },
  },
  resolve: (_root, { id, role }) => updateUserRole(id, role),
};

export default UpdateUserRole;
