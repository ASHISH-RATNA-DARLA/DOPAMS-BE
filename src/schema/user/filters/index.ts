import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

import RoleEnumType from '../enums/user-role';
import UserStatusEnumType from '../enums/user-status';

const UserFilterInputType = new GraphQLInputObjectType({
  name: 'UserFilterInputType',
  fields: () => ({
    text: {
      type: GraphQLString,
    },
    status: {
      type: UserStatusEnumType,
    },
    roles: {
      type: new GraphQLList(RoleEnumType),
    },
  }),
});

export { UserFilterInputType };
