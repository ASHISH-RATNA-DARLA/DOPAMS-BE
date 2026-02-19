import { GraphQLError } from 'graphql';

class ServiceUnavailable extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'SERVICE_NOT_AVAILABLE' } });

    Object.defineProperty(this, 'name', {
      value: 'ServiceUnavailable',
    });
  }
}

export default ServiceUnavailable;
