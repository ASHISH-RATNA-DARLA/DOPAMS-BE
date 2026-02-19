import { GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { DomicileType } from 'schema/misc/domicile';
import { IntRangeType, StringRangeType } from 'schema/misc/range';

export const FirFilterInputType = new GraphQLInputObjectType({
  name: 'FirFilterInputType',
  fields: () => ({
    firNumber: { type: GraphQLString },
    crimeType: { type: GraphQLString },
    name: { type: GraphQLString },
    relativeName: { type: GraphQLString },
    dateRange: { type: StringRangeType },
    domicile: { type: DomicileType },
    caseStatus: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    psName: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    caseClass: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    units: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    accuseds: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    years: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
    drugTypes: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    drugQuantityRange: { type: IntRangeType },
    drugWorthRange: { type: IntRangeType },
  }),
});
