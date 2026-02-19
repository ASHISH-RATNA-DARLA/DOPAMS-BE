import { GraphQLError } from 'graphql';

class PermissionAlreadyExists extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'PERMISSION_ALREADY_EXISTS' } });

    Object.defineProperty(this, 'name', {
      value: 'PermissionAlreadyExists',
    });
  }
}

export default PermissionAlreadyExists;
