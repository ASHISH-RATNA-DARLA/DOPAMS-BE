import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { PageNumberCounters, PageNumberPagination } from 'prisma-extension-pagination/dist/types';

type Pagination = PageNumberPagination & PageNumberCounters;

export const PaginationType = new GraphQLObjectType<Pagination>({
  name: 'PaginationType',
  fields: () => ({
    isFirstPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: pageInfo => pageInfo.isFirstPage,
    },
    isLastPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: pageInfo => pageInfo.isLastPage,
    },
    currentPage: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: pageInfo => pageInfo.currentPage,
    },
    previousPage: {
      type: GraphQLInt,
      resolve: pageInfo => pageInfo.previousPage,
    },
    nextPage: {
      type: GraphQLInt,
      resolve: pageInfo => pageInfo.nextPage,
    },
    pageCount: {
      type: GraphQLInt,
      resolve: pageInfo => pageInfo.pageCount,
    },
    totalCount: {
      type: GraphQLInt,
      resolve: pageInfo => pageInfo.totalCount,
    },
  }),
});
