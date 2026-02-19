import { GraphQLError } from 'graphql';

class FailedOperationException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'FAILED_OPERATION' } });

    Object.defineProperty(this, 'name', {
      value: 'FailedOperationException',
    });
  }
}

export default FailedOperationException;
