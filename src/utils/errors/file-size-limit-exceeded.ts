import { GraphQLError } from 'graphql';

class FileSizeLimitExceeded extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'FILE_SIZE_LIMIT_EXCEEDED' } });

    Object.defineProperty(this, 'name', {
      value: 'FileSizeLimitExceeded',
    });
  }
}

export default FileSizeLimitExceeded;
