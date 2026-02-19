import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { StatisticsListType } from 'schema/misc/statistics';

export const SeizuresFilterValuesType = new GraphQLObjectType({
  name: 'SeizuresFilterValuesType',
  fields: () => ({
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt))) },
    drugTypes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
  }),
});

export const SeizuresStatisticsType = new GraphQLObjectType({
  name: 'SeizuresStatisticsType',
  fields: () => ({
    totalSeizures: { type: new GraphQLNonNull(GraphQLInt) },
    seizuresStatisticsBreakdownByDrugType: { type: new GraphQLNonNull(StatisticsListType) },
    seizuresStatisticsBreakdownByCaseClass: { type: new GraphQLNonNull(StatisticsListType) },
  }),
});

const SeizureAbstractTotalsType = new GraphQLObjectType({
  name: 'SeizureAbstractTotalsType',
  fields: () => ({
    totalCases: { type: new GraphQLNonNull(GraphQLInt) },
    totalQuantityKg: { type: new GraphQLNonNull(GraphQLString) },
    totalQuantityMl: { type: new GraphQLNonNull(GraphQLString) },
    totalQuantityCount: { type: new GraphQLNonNull(GraphQLString) },
    totalWorth: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const SeizureAbstractYearTotalEntryType = new GraphQLObjectType({
  name: 'SeizureAbstractYearTotalEntryType',
  fields: () => ({
    year: { type: new GraphQLNonNull(GraphQLString) },
    totalCases: { type: new GraphQLNonNull(GraphQLInt) },
    totalQuantityKg: { type: new GraphQLNonNull(GraphQLString) },
    totalQuantityMl: { type: new GraphQLNonNull(GraphQLString) },
    totalQuantityCount: { type: new GraphQLNonNull(GraphQLString) },
    totalWorth: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const SeizureAbstractRowType = new GraphQLObjectType({
  name: 'SeizureAbstractRowType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    totalsByYear: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SeizureAbstractYearTotalEntryType))) },
    totals: { type: new GraphQLNonNull(SeizureAbstractTotalsType) },
  }),
});

export const SeizuresAbstractType = new GraphQLObjectType({
  name: 'SeizuresAbstractType',
  fields: () => ({
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    drugs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SeizureAbstractRowType))) },
  }),
});
