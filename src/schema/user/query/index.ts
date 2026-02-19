import { GraphQLID, GraphQLInt, GraphQLNonNull } from 'graphql';

import UserSortByEnumType from '../enums/sort-by';
import SortTypeEnumType from 'schema/misc/enums/sort-type';
import { UserFilterInputType } from '../filters';

import { getUser, getUsers } from '../services';
import { UsersType, UserType } from '..';

const UserQueryFields = {
  user: {
    type: new GraphQLNonNull(UserType),
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: (_root, { id }) => getUser(id),
  },
  users: {
    type: new GraphQLNonNull(UsersType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      sortKey: { type: UserSortByEnumType, defaultValue: 'createdAt' },
      sortOrder: { type: SortTypeEnumType, defaultValue: 'desc' },
      filters: { type: UserFilterInputType },
    },
    resolve: (_root, { page, limit, sortKey, sortOrder, filters }) =>
      getUsers(page, limit, sortKey, sortOrder, filters),
  },
};

export default UserQueryFields;
