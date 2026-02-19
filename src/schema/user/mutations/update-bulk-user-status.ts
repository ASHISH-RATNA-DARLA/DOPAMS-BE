import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

import UserStatusEnumType from '../enums/user-status';
import { updateBulkUserStatus } from '../services';

const UpdateBulkUserStatus = {
  type: GraphQLBoolean,
  args: {
    ids: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))) },
    status: { type: new GraphQLNonNull(UserStatusEnumType) },
  },
  resolve: (_root, { ids, status }) => updateBulkUserStatus(ids, status),
};

export default UpdateBulkUserStatus;
