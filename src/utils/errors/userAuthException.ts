import { GraphQLError } from 'graphql';

class UserAuthException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'USER-AUTH-EXCEPTION' } });

    Object.defineProperty(this, 'name', {
      value: 'UserAuthException',
    });
  }
}

export default UserAuthException;
