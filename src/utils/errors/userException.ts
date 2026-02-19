import { GraphQLError } from 'graphql';

class UserException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'USER-EXCEPTION' } });

    Object.defineProperty(this, 'name', {
      value: 'UserException',
    });
  }
}

export default UserException;
