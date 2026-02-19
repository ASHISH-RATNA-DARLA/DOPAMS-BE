import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import SortTypeEnumType from 'schema/misc/enums/sort-type';
import { CriminalProfilesType, CriminalProfileType } from '..';
import { AccusedCaseHistoryType, PersonSearchResultType } from '../case-history';
import CriminalProfileSortByEnumType from '../enums/sort-by';
import { CriminalProfilesFilterInputType } from '../filters';
import { getCriminalProfile, getCriminalProfiles } from '../services';
import { getAccusedCaseHistory, getPersonCaseHistory, searchPersonsByName } from '../services/case-history';

const CriminalProfileQueryFields = {
  criminalProfile: {
    type: new GraphQLNonNull(CriminalProfileType),
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: (_root, { id }) => getCriminalProfile(id),
  },
  criminalProfiles: {
    type: new GraphQLNonNull(CriminalProfilesType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
      sortKey: { type: CriminalProfileSortByEnumType, defaultValue: 'noOfCrimes' },
      sortOrder: { type: SortTypeEnumType, defaultValue: 'desc' },
      filters: { type: CriminalProfilesFilterInputType },
    },
    resolve: (_root, { page, limit, sortKey, sortOrder, filters }) =>
      getCriminalProfiles(page, limit, sortKey, sortOrder, filters),
  },

  // NEW: Get complete case history for an accused (shows all crimes across duplicate records)
  accusedCaseHistory: {
    type: new GraphQLNonNull(AccusedCaseHistoryType),
    description: 'Get complete case history for an accused including deduplicated records',
    args: {
      accusedId: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The accused ID to get case history for',
      },
    },
    resolve: (_root, { accusedId }) => getAccusedCaseHistory(accusedId),
  },

  // NEW: Get case history by person ID
  personCaseHistory: {
    type: new GraphQLNonNull(AccusedCaseHistoryType),
    description: 'Get case history for a person by person ID',
    args: {
      personId: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The person ID to get case history for',
      },
    },
    resolve: (_root, { personId }) => getPersonCaseHistory(personId),
  },

  // NEW: Search persons by name
  searchPersonsByName: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PersonSearchResultType))),
    description: 'Search for persons by name with deduplication',
    args: {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'Name to search for (partial match supported)',
      },
    },
    resolve: (_root, { name }) => searchPersonsByName(name),
  },
};

export default CriminalProfileQueryFields;
