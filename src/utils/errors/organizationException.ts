import { GraphQLError } from 'graphql';

class DepartmentException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'DEPARTMENT-EXCEPTION' } });

    Object.defineProperty(this, 'name', {
      value: 'DepartmentException',
    });
  }
}

export default DepartmentException;
