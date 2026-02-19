import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import {
  ClassificationsType,
  CourtRelatedInfoType,
  DrugCasesType,
  DrugDataType,
  InvestigationRelatedInfoType,
  OverallCrimeStatsType,
  RegionalOverviewType,
} from '..';
import {
  getAccusedTypeClassification,
  getCaseClassificationUI,
  getCaseStatusClassification,
  getCourtRelatedInfo,
  getDomicileClassification,
  getDrugCases,
  getDrugData,
  getInvestigationRelatedInfo,
  getOverallCrimeStats,
  getRegionalOverview,
  getStipulatedTimeClassification,
  getTrialCasesClassification,
} from '../services';

const HomeQueryFields = {
  overallCrimeStats: {
    type: new GraphQLNonNull(OverallCrimeStatsType),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getOverallCrimeStats(from, to),
  },
  caseStatusClassification: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getCaseStatusClassification(from, to),
  },
  regionalOverview: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RegionalOverviewType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getRegionalOverview(from, to),
  },
  drugData: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DrugDataType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
      drugNames: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    },
    resolve: (_root, { from, to, drugNames }) => getDrugData(from, to, drugNames),
  },
  drugCases: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DrugCasesType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getDrugCases(from, to),
  },
  caseClassificationUI: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getCaseClassificationUI(from, to),
  },
  trialCasesClassification: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getTrialCasesClassification(from, to),
  },
  accusedTypeClassification: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getAccusedTypeClassification(from, to),
  },
  domicileClassification: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getDomicileClassification(from, to),
  },
  stipulatedTimeClassification: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ClassificationsType))),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getStipulatedTimeClassification(from, to),
  },
  investigationRelatedInfo: {
    type: new GraphQLNonNull(InvestigationRelatedInfoType),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getInvestigationRelatedInfo(from, to),
  },
  courtRelatedInfo: {
    type: new GraphQLNonNull(CourtRelatedInfoType),
    args: {
      from: { type: GraphQLString },
      to: { type: GraphQLString },
    },
    resolve: (_root, { from, to }) => getCourtRelatedInfo(from, to),
  },
};

export default HomeQueryFields;
