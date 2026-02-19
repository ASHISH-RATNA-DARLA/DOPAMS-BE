import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const DomicileType = new GraphQLInputObjectType({
  name: 'DomicileType',
  fields: () => ({
    houseNo: { type: GraphQLString },
    streetRoadNo: { type: GraphQLString },
    wardColony: { type: GraphQLString },
    landmarkMilestone: { type: GraphQLString },
    localityVillage: { type: GraphQLString },
    areaMandal: { type: GraphQLString },
    district: { type: GraphQLString },
    stateUT: { type: GraphQLString },
    country: { type: GraphQLString },
    residencyType: { type: GraphQLString },
    pinCode: { type: GraphQLString },
    jurisdictionPS: { type: GraphQLString },
  }),
});
