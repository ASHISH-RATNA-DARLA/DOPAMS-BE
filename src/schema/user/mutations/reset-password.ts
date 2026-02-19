import { GraphQLNonNull, GraphQLString } from 'graphql';

import { ForgotPasswordType } from '..';
import { resetPassword } from '../services';

const ResetPassword = {
  type: ForgotPasswordType,
  args: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_root, { userId }) => resetPassword(userId),
};

export default ResetPassword;
