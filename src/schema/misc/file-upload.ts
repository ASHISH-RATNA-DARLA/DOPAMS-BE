import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { toLocalTime } from 'utils/misc';
import StatusEnumType from './enums/status';

const FileUploadStatusType = new GraphQLObjectType({
  name: 'FileUploadStatusType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of Province',
      resolve: province => province.id,
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Name of the Province',
      resolve: province => province.name,
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: province => province.reference,
    },
    status: {
      type: new GraphQLNonNull(StatusEnumType),
      resolve: province => province.status,
    },
    createdAt: {
      type: GraphQLString,
      resolve: province => toLocalTime(province.createdAt),
    },
  }),
});

export default FileUploadStatusType;
