import { GraphQLNonNull, GraphQLString } from 'graphql';

import { AuthPayloadType } from '..';
import { acceptUserInviteAndSetPassword } from '../services';

const AcceptUserInvite = {
  type: AuthPayloadType,
  args: {
    inviteToken: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_root, { inviteToken, password }) => acceptUserInviteAndSetPassword(inviteToken, password),
};

export default AcceptUserInvite;
