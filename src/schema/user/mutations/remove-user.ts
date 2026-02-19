import { GraphQLID, GraphQLNonNull } from 'graphql';

import { UserType } from 'schema/user';
import RoleEnumType from 'schema/user/enums/user-role';

import { getEnumValue } from 'utils/misc';
import { removeUser } from '../services';
const RemoveUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_root, { id }, { currentUser: user }) => {
    if (user.role !== getEnumValue(RoleEnumType.getValue('SUPER_ADMIN'))) {
      throw new Error('You are not authorized to remove users');
    }

    return removeUser(id);
  },
};

export default RemoveUser;
