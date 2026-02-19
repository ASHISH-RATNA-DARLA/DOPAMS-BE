import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: () => ({
    canCreateUser: {
      type: GraphQLBoolean,
      resolve: permissions => permissions.createUser || false,
    },
    canDeleteUser: {
      type: GraphQLBoolean,
      resolve: permissions => permissions.deleteUser || false,
    },
    canLogoutUser: {
      type: GraphQLBoolean,
      resolve: permissions => permissions.logoutUser || false,
    },
  }),
});

export default PermissionType;
