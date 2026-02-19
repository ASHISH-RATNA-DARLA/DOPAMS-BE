import { GraphQLError } from 'graphql';

class EmployeeException extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'EMPLOYEE_EXCEPTION' } });

    Object.defineProperty(this, 'name', {
      value: 'EmployeeException',
    });
  }
}

export default EmployeeException;
