import { GraphQLError } from 'graphql';

class IdentityCardException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'IDENTITY-CARD-EXCEPTION' } });

    Object.defineProperty(this, 'name', {
      value: 'IdentityCardException',
    });
  }
}

export default IdentityCardException;
