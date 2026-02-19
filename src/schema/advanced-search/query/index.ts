import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { AdvancedSearchAutocompleteResultType, AdvancedSearchType } from '..';
import { AdvancedSearchFilterInputType } from '../input';
import { advancedSearch, fieldAutocomplete } from '../services';
import AdvancedSearchColumnEnumType from '../enum/columns';
import SortTypeEnumType from 'schema/misc/enums/sort-type';

const AdvancedSearchQueryFields = {
  advancedSearch: {
    type: AdvancedSearchType,
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      sortKey: { type: AdvancedSearchColumnEnumType, defaultValue: 'firDate' },
      sortOrder: { type: SortTypeEnumType, defaultValue: 'desc' },
      filters: { type: new GraphQLList(new GraphQLNonNull(AdvancedSearchFilterInputType)) },
      select: { type: new GraphQLList(new GraphQLNonNull(AdvancedSearchColumnEnumType)) },
    },
    resolve: (_root, { page, limit, sortKey, sortOrder, filters, select }) =>
      advancedSearch(page, limit, sortKey, sortOrder, filters, select),
  },
  fieldAutoComplete: {
    type: new GraphQLList(new GraphQLNonNull(AdvancedSearchAutocompleteResultType)),
    args: {
      fields: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AdvancedSearchColumnEnumType))) },
      input: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (_root, { fields, input }) => fieldAutocomplete(fields, input),
  },
};

export default AdvancedSearchQueryFields;
