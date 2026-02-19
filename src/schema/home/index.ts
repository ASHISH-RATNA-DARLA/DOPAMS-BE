import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const OverallCrimeStatsType = new GraphQLObjectType({
  name: 'OverallCrimeStatsType',
  fields: () => ({
    totalCases: { type: GraphQLInt },
    totalAccusedInvolved: { type: GraphQLInt },
    totalArrests: { type: GraphQLInt },
    totalSeizuresKg: { type: GraphQLString },
    totalSeizuresMl: { type: GraphQLString },
    totalSeizuresWorth: { type: GraphQLString },
    totalCommercialFirs: { type: GraphQLInt },
    totalConvictionFirs: { type: GraphQLInt },
  }),
});

export const InvestigationRelatedInfoType = new GraphQLObjectType({
  name: 'InvestigationRelatedInfoType',
  fields: () => ({
    underInvestigation: { type: GraphQLInt },
    BNSS: { type: GraphQLInt },
    arrested: { type: GraphQLInt },
    absconding: { type: GraphQLInt },
    fslPending: { type: GraphQLInt },
    chargeSheetFiled: { type: GraphQLInt },
    ccNoReceived: { type: GraphQLInt },
    casesCrossedMandatoryTime: { type: GraphQLInt },
    propertyForfeitureOrders: { type: GraphQLInt },
    pitndpsInitiated: { type: GraphQLInt },
  }),
});

export const CourtRelatedInfoType = new GraphQLObjectType({
  name: 'CourtRelatedInfoType',
  fields: () => ({
    casesPendingTrial: { type: GraphQLInt },
    casesAcquitted: { type: GraphQLInt },
    casesConvicted: { type: GraphQLInt },
    casesAbated: { type: GraphQLInt },
    bailPetitionsFiled: { type: GraphQLInt },
    bailGranted: { type: GraphQLInt },
    bailRejected: { type: GraphQLInt },
    nbwsExecuted: { type: GraphQLInt },
    totalTrialConducted: { type: GraphQLInt },
  }),
});

export const RegionalOverviewType = new GraphQLObjectType({
  name: 'RegionalOverviewType',
  fields: () => ({
    unit: { type: new GraphQLNonNull(GraphQLString) },
    firs: { type: new GraphQLNonNull(GraphQLInt) },
    accusedCited: { type: new GraphQLNonNull(GraphQLInt) },
    arrests: { type: new GraphQLNonNull(GraphQLInt) },
    absconding: { type: new GraphQLNonNull(GraphQLInt) },
    totalWorthOfSeizedDrugs: { type: new GraphQLNonNull(GraphQLString) },
    convictions: { type: new GraphQLNonNull(GraphQLInt) },
    acquittals: { type: new GraphQLNonNull(GraphQLInt) },
    commercialFirs: { type: new GraphQLNonNull(GraphQLInt) },
    ganjaSeizuresKg: { type: new GraphQLNonNull(GraphQLString) },
    arrestedForeignNationals: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const DrugDataType = new GraphQLObjectType({
  name: 'DrugDataType',
  fields: () => ({
    label: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const DrugCasesType = new GraphQLObjectType({
  name: 'DrugCasesType',
  fields: () => ({
    drugType: { type: new GraphQLNonNull(GraphQLString) },
    crimes: { type: new GraphQLNonNull(GraphQLInt) },
    accuseds: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const ClassificationsType = new GraphQLObjectType({
  name: 'ClassificationsType',
  fields: () => ({
    label: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});
