import { GraphQLNonNull, GraphQLString } from 'graphql';

import { ForgotPasswordType } from '..';
import { forgotPassword } from '../services';

const ForgotPassword = {
  type: ForgotPasswordType,
  args: {
    emailId: { type: new GraphQLNonNull(GraphQLString) },
    callBackUrl: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_root, { emailId, callBackUrl }) => forgotPassword(emailId, callBackUrl),
};

export default ForgotPassword;
