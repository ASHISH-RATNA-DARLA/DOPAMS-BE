import { GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { DomicileType } from 'schema/misc/domicile';
import { IntRangeType, StringRangeType } from 'schema/misc/range';

export const AccusedFilterInputType = new GraphQLInputObjectType({
  name: 'AccusedFilterInputType',
  fields: () => ({
    name: { type: GraphQLString },
    units: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    years: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
    accuseds: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    drugTypes: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    nationality: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    state: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    domicileClass: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    gender: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    domicile: { type: DomicileType },
    caseStatus: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    ageRange: { type: IntRangeType },
    dateRange: { type: StringRangeType },
    ps: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    caseClass: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    accusedStatus: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    accusedType: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    accusedRole: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
  }),
});
