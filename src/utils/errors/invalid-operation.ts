import { GraphQLError } from 'graphql';

class InvalidOperationException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'INVALID_OPERATION' } });

    Object.defineProperty(this, 'name', {
      value: 'InvalidOperationException',
    });
  }
}

export default InvalidOperationException;
