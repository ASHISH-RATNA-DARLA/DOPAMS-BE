import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { GraphQLUpload } from 'graphql-upload-ts';

import { uploadIr54DocumentService } from 'modules/ir54/service';

const Ir54MutationFields = {
  uploadIr54Document: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      recordId: { type: new GraphQLNonNull(GraphQLID) },
      documentField: { type: new GraphQLNonNull(GraphQLString) },
      file: { type: new GraphQLNonNull(GraphQLUpload) },
    },
    resolve: (_root, { file, recordId, documentField }, { currentUser }) =>
      uploadIr54DocumentService(file, recordId, documentField, currentUser),
  },
};

export default Ir54MutationFields;
