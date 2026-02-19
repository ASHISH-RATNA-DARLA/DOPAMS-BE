import { GraphQLUpload } from 'graphql-upload-ts';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import { uploadFile } from '../services';

const FirMutationsFields = {
  uploadFirFile: {
    type: GraphQLString,
    args: {
      firId: { type: new GraphQLNonNull(GraphQLID) },
      file: { type: new GraphQLNonNull(GraphQLUpload) },
    },
    resolve: (_root, { file, firId }) => uploadFile(file, firId),
  },
};

export default FirMutationsFields;
