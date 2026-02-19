import { GraphQLNonNull, GraphQLString } from 'graphql';

import { getCriminalNetworkDetails } from '../services';
import { CriminalNetworkDetailsType } from '..';

const PersonQueryFields = {
  criminalNetworkDetails: {
    type: new GraphQLNonNull(CriminalNetworkDetailsType),
    args: {
      personId: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (_root, { personId }) => getCriminalNetworkDetails(personId),
  },
};

export default PersonQueryFields;
