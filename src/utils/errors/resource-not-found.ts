import { GraphQLError } from 'graphql';

class ResourceNotFoundException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'RESOURCE_NOT_FOUND' } });

    Object.defineProperty(this, 'name', {
      value: 'ResourceNotFoundException',
    });
  }
}

export default ResourceNotFoundException;
