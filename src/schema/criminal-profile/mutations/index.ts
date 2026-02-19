import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { GraphQLUpload } from 'graphql-upload-ts';

import { uploadCriminalProfileFile } from '../services';

const CriminalProfileMutationsFields = {
  uploadCriminalProfileFile: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      file: { type: new GraphQLNonNull(GraphQLUpload) },
    },
    resolve: (_root, { file, id }) => uploadCriminalProfileFile(file, id),
  },
};

export default CriminalProfileMutationsFields;
