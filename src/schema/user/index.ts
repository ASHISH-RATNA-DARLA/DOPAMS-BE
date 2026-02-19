import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import getIndianDateObject from 'utils/indian-date-object';

import UserStatusEnumType from './enums/user-status';

import RoleEnumType from './enums/user-role';
import { PaginationType } from 'schema/pagination/pagination';

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: user => user.id,
    },
    email: {
      type: GraphQLString,
      resolve: user => user.email,
    },
    status: {
      type: new GraphQLNonNull(UserStatusEnumType),
      resolve: user => user.status,
    },
    role: {
      type: new GraphQLNonNull(RoleEnumType),
      resolve: user => user.role,
    },
    backgroundColor: {
      type: GraphQLString,
      resolve: user => user.backgroundColor,
    },
    createdAt: {
      type: GraphQLString,
      resolve: user => getIndianDateObject(user.createdAt),
    },
    updatedAt: {
      type: GraphQLString,
      resolve: user => getIndianDateObject(user.updatedAt),
    },
  }),
});

export const UsersType = new GraphQLObjectType({
  name: 'UsersType',
  fields: () => ({
    nodes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: obj => obj.users,
    },
    pageInfo: {
      type: new GraphQLNonNull(PaginationType),
      resolve: obj => obj.pageInfo,
    },
  }),
});

export const AuthenticationResponseType = new GraphQLObjectType({
  name: 'AuthenticationResponseType',
  fields: () => ({
    token: {
      type: GraphQLString,
      resolve: auth => {
        return auth.userSession.token;
      },
    },
    user: {
      type: UserType,
      resolve: auth => {
        return auth.user;
      },
    },
  }),
});

export const AuthPayloadType = new GraphQLObjectType({
  name: 'AuthPayloadType',
  fields: () => ({
    token: {
      type: GraphQLString,
      resolve: auth => auth.token,
    },
    user: {
      type: UserType,
      resolve: auth => auth.user,
    },
  }),
});

export const ForgotPasswordType = new GraphQLObjectType({
  name: 'ForgotPassword',
  fields: () => ({
    status: {
      type: GraphQLBoolean,
      resolve: auth => {
        return auth.status;
      },
    },
    message: {
      type: GraphQLString,
      resolve: auth => {
        return auth.message;
      },
    },
  }),
});
