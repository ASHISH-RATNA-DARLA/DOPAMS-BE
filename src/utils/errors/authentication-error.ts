import { GraphQLError } from 'graphql';

class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'AUTHENTICATION_ERROR' } });

    Object.defineProperty(this, 'name', {
      value: 'AuthenticationError',
    });
  }
}

export default AuthenticationError;
