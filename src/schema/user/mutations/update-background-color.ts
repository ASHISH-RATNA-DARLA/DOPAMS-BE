import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import { updateUserBackgroundColor } from '../services';

import { UserType } from 'schema/user';

const UpdateUserBackgroundColor = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    backgroundColor: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_root, { id, backgroundColor }) => updateUserBackgroundColor(id, backgroundColor),
};

export default UpdateUserBackgroundColor;
