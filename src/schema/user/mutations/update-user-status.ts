import { GraphQLID, GraphQLNonNull } from 'graphql';

import { updateUserStatus } from '../services';
import UserStatusEnumType from '../enums/user-status';

import { UserType } from 'schema/user';

const UpdateUserStatus = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(UserStatusEnumType) },
  },
  resolve: (_root, { id, status }) => updateUserStatus(id, status),
};

export default UpdateUserStatus;
