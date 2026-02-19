import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import AdvancedSearchColumnEnumType from '../enum/columns';
import AdvancedSearchOperatorsEnumType from '../enum/operators';
import AdvancedSearchConnectorsEnumType from '../enum/connectors';

export const AdvancedSearchFilterInputType = new GraphQLInputObjectType({
  name: 'AdvancedSearchFilterInputType',
  fields: () => ({
    field: { type: new GraphQLNonNull(AdvancedSearchColumnEnumType) },
    operator: { type: new GraphQLNonNull(AdvancedSearchOperatorsEnumType) },
    connector: { type: AdvancedSearchConnectorsEnumType },
    value: { type: new GraphQLNonNull(GraphQLString) },
    value2: { type: GraphQLString },
  }),
});
