import { GraphQLNonNull, GraphQLString } from 'graphql';

import { AuthPayloadType } from '..';
import { login } from '../services';

const Login = {
  type: AuthPayloadType,
  args: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_root, { email, password }) => login(email, password),
};

export default Login;
