import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { PaginationType } from 'schema/pagination/pagination';
import { StatisticsListType } from 'schema/misc/statistics';
import { IrDetailsType } from './interrogation_report';
import { DrugTypeGroupType } from './seizures';

export const FirType = new GraphQLObjectType({
  name: 'FirType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    unit: { type: GraphQLString },
    ps: { type: GraphQLString },
    year: { type: GraphQLInt },
    firNumber: { type: GraphQLString },
    firRegNum: { type: GraphQLString },
    majorHead: { type: GraphQLString },
    minorHead: { type: GraphQLString },
    section: { type: GraphQLString },
    crimeRegDate: { type: GraphQLString },
    firType: { type: GraphQLString },
    crimeType: { type: GraphQLString },
    ioName: { type: GraphQLString },
    ioRank: { type: GraphQLString },
    briefFacts: { type: GraphQLString },
    noOfAccusedInvolved: { type: GraphQLInt },
    accusedDetails: { type: new GraphQLList(new GraphQLNonNull(AccusedDetailsType)) },
    propertyDetails: { type: new GraphQLList(new GraphQLNonNull(PropertyDetails)) },
    moSeizuresDetails: { type: new GraphQLList(new GraphQLNonNull(MoSeizureDetailsType)) },
    drugWithQuantity: { type: new GraphQLList(new GraphQLNonNull(DrugDetailsType)) },
    caseClassification: { type: GraphQLString },
    caseStatus: { type: GraphQLString },
    isCommercial: { type: GraphQLBoolean },
    convictionCount: { type: GraphQLInt },
    acquittalCount: { type: GraphQLInt }, // NEW — was missing from original
    totalDisposals: { type: GraphQLInt },
    stipulatedPeriodForCS: { type: GraphQLString },
    chargesheets: { type: new GraphQLList(new GraphQLNonNull(ChargesheetType)) },
    chargesheetUpdates: { type: new GraphQLList(new GraphQLNonNull(ChargesheetUpdateType)) },
    documents: { type: new GraphQLList(new GraphQLNonNull(FileDetailsType)) }, // changed: was DocumentType, now FileDetailsType (has fileUrl)
    firCopy: { type: GraphQLString },
    firCopyUrl: { type: GraphQLString }, // NEW — full Tomcat URL computed by MV
    propertyDocuments: { type: new GraphQLList(new GraphQLNonNull(FileDetailsType)) },
    irDocuments: { type: new GraphQLList(new GraphQLNonNull(FileDetailsType)) },
    chargesheetDocuments: { type: new GraphQLList(new GraphQLNonNull(FileDetailsType)) },
    moMediaDocuments: { type: new GraphQLList(new GraphQLNonNull(FileDetailsType)) },
    disposalDetails: { type: new GraphQLList(new GraphQLNonNull(DisposalDetailsType)) },
    irDetails: { type: new GraphQLList(new GraphQLNonNull(IrDetailsType)) },
    casePropertyDetails: { type: new GraphQLList(new GraphQLNonNull(CasePropertyDetailsType)) },
  }),
});

// UPDATED: added id, name, filePath, fileUrl alongside original type+link fields
// documents, propertyDocuments and irDocuments all use this type
const FileDetailsType = new GraphQLObjectType({
  name: 'FileDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    filePath: { type: GraphQLString },
    fileUrl: { type: GraphQLString }, // NEW — full Tomcat URL
    link: { type: GraphQLString }, // kept for backward compat
    isDownloaded: { type: GraphQLBoolean },
  }),
});

const PropertyDetails = new GraphQLObjectType({
  name: 'PropertyDetails',
  fields: () => ({
    id: { type: GraphQLString },
    propertyStatus: { type: GraphQLString },
    recoveredFrom: { type: GraphQLString },
    placeOfRecovery: { type: GraphQLString },
    dateOfSeizure: { type: GraphQLString },
    nature: { type: GraphQLString },
    belongs: { type: GraphQLString },
    estimatedValue: { type: GraphQLString },
    recoveredValue: { type: GraphQLString },
    particularOfProperty: { type: GraphQLString },
    category: { type: GraphQLString },
  }),
});

const MoSeizureDetailsType = new GraphQLObjectType({
  name: 'MoSeizureDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    seqNo: { type: GraphQLString },
    moId: { type: GraphQLString },
    type: { type: GraphQLString },
    subType: { type: GraphQLString },
    description: { type: GraphQLString },
    seizedFrom: { type: GraphQLString },
    seizedAt: { type: GraphQLString },
    seizedBy: { type: GraphQLString },
    strengthOfEvidence: { type: GraphQLString },
    posAddress1: { type: GraphQLString },
    posAddress2: { type: GraphQLString },
    posCity: { type: GraphQLString },
    posDistrict: { type: GraphQLString },
    posPincode: { type: GraphQLString },
    posLandmark: { type: GraphQLString },
    posDescription: { type: GraphQLString },
    posLatitude: { type: GraphQLString },
    posLongitude: { type: GraphQLString },
    moMediaUrl: { type: GraphQLString },
    moMediaName: { type: GraphQLString },
    moMediaFileId: { type: GraphQLString },
  }),
});

// UPDATED: added personId for criminal-profile navigation
// kept id + value for backward compat with any other code that references them
const AccusedDetailsType = new GraphQLObjectType({
  name: 'AccusedDetailsType',
  fields: () => ({
    id: { type: GraphQLID },
    value: { type: GraphQLString },
    fullName: { type: GraphQLString },
    personId: { type: GraphQLString }, // NEW — used for /criminal-profile navigation
    personCode: { type: GraphQLString },
    accusedType: { type: GraphQLString },
    status: { type: GraphQLString },
    alias: { type: GraphQLString },
  }),
});

const ChargesheetActType = new GraphQLObjectType({
  name: 'ChargesheetActType',
  fields: () => ({
    id: { type: GraphQLID },
    actDescription: { type: GraphQLString },
    section: { type: GraphQLString },
    rwRequired: { type: GraphQLBoolean },
    sectionDescription: { type: GraphQLString },
    graveParticulars: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

const ChargesheetAccusedType = new GraphQLObjectType({
  name: 'ChargesheetAccusedType',
  fields: () => ({
    id: { type: GraphQLID },
    personId: { type: GraphQLString },
    value: { type: GraphQLString },
    chargeStatus: { type: GraphQLString },
    requestedForNbw: { type: GraphQLBoolean },
    reasonForNoCharge: { type: GraphQLString },
    isPersonMasterPresent: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
  }),
});

const ChargesheetType = new GraphQLObjectType({
  name: 'ChargesheetType',
  fields: () => ({
    id: { type: GraphQLID },
    chargesheetNo: { type: GraphQLString },
    chargesheetNoIcjs: { type: GraphQLString },
    chargesheetDate: { type: GraphQLString },
    chargeSheetDate: { type: GraphQLString },
    chargesheetType: { type: GraphQLString },
    courtName: { type: GraphQLString },
    isCcl: { type: GraphQLBoolean },
    isEsigned: { type: GraphQLBoolean },
    dateCreated: { type: GraphQLString },
    dateModified: { type: GraphQLString },
    acts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ChargesheetActType))) },
    accuseds: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ChargesheetAccusedType))) },
  }),
});

const ChargesheetUpdateType = new GraphQLObjectType({
  name: 'ChargesheetUpdateType',
  fields: () => ({
    id: { type: GraphQLID },
    updateChargeSheetId: { type: GraphQLString },
    chargeSheetNo: { type: GraphQLString },
    chargesheetDate: { type: GraphQLString },
    chargeSheetDate: { type: GraphQLString },
    chargeSheetStatus: { type: GraphQLString },
    takenOnFileDate: { type: GraphQLString },
    takenOnFileCaseType: { type: GraphQLString },
    takenOnFileCourtCaseNo: { type: GraphQLString },
    dateCreated: { type: GraphQLString },
  }),
});

export const DisposalDetailsType = new GraphQLObjectType({
  name: 'DisposalDetailsType',
  fields: () => ({
    id: { type: GraphQLID },
    disposalType: { type: GraphQLString },
    disposedAt: { type: GraphQLString },
    disposal: { type: GraphQLString },
    caseStatus: { type: GraphQLString },
    dateCreated: { type: GraphQLString },
    dateModified: { type: GraphQLString },
  }),
});

const CasePropertyDetailsType = new GraphQLObjectType({
  name: 'CasePropertyDetailsType',
  fields: () => ({
    casePropertyId: { type: GraphQLString },
    caseType: { type: GraphQLString },
    moId: { type: GraphQLString },
    status: { type: GraphQLString },
    sendDate: { type: GraphQLString },
    fslDate: { type: GraphQLString },
    dateDisposal: { type: GraphQLString },
    releaseDate: { type: GraphQLString },
    returnDate: { type: GraphQLString },
    dateCustody: { type: GraphQLString },
    dateSentToExpert: { type: GraphQLString },
    courtOrderDate: { type: GraphQLString },
    forwardingThrough: { type: GraphQLString },
    courtName: { type: GraphQLString },
    fslCourtName: { type: GraphQLString },
    cprCourtName: { type: GraphQLString },
    courtOrderNumber: { type: GraphQLString },
    fslNo: { type: GraphQLString },
    fslRequestId: { type: GraphQLString },
    reportReceived: { type: GraphQLBoolean },
    opinion: { type: GraphQLString },
    opinionFurnished: { type: GraphQLString },
    strengthOfEvidence: { type: GraphQLString },
    expertType: { type: GraphQLString },
    otherExpertType: { type: GraphQLString },
    cprNo: { type: GraphQLString },
    directionByCourt: { type: GraphQLString },
    detailsDisposal: { type: GraphQLString },
    placeDisposal: { type: GraphQLString },
    releaseOrderNo: { type: GraphQLString },
    placeCustody: { type: GraphQLString },
    assignCustody: { type: GraphQLString },
    propertyReceivedBack: { type: GraphQLBoolean },
    dateCreated: { type: GraphQLString },
    dateModified: { type: GraphQLString },
  }),
});

export const DrugDetailsType = new GraphQLObjectType({
  name: 'DrugDetailsType',
  fields: () => ({
    name: { type: GraphQLString },
    quantity: { type: GraphQLString },
    quantityKg: { type: GraphQLString },
    quantityMl: { type: GraphQLString },
    quantityCount: { type: GraphQLString },
    worth: { type: GraphQLString },
  }),
});

export const FirsType = new GraphQLObjectType({
  name: 'FirsType',
  fields: () => ({
    nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FirType))) },
    pageInfo: { type: new GraphQLNonNull(PaginationType) },
  }),
});

export const FirsStatisticsType = new GraphQLObjectType({
  name: 'FirsStatisticsType',
  fields: () => ({
    totalFirs: { type: new GraphQLNonNull(GraphQLInt) },
    firStatisticsBreakdownByCaseClassUI: { type: new GraphQLNonNull(StatisticsListType) },
    firStatisticsBreakdownByCaseClassPT: { type: new GraphQLNonNull(StatisticsListType) },
    firStatisticsBreakdownByCaseStatus: { type: new GraphQLNonNull(StatisticsListType) },
    firStatisticsBreakdownByCrimeType: { type: new GraphQLNonNull(StatisticsListType) },
  }),
});

export const FirsFilterValuesType = new GraphQLObjectType({
  name: 'FirsFilterValuesType',
  fields: () => ({
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    ps: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    caseClass: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    caseStatus: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt))) },
    drugTypes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DrugTypeGroupType))) },
  }),
});

export const UiPtCasesStatisticsPsType = new GraphQLObjectType({
  name: 'UiPtCasesStatisticsPsType',
  fields: () => ({
    psName: { type: new GraphQLNonNull(GraphQLString) },
    crimes: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const UiPtCasesStatisticsUnitsType = new GraphQLObjectType({
  name: 'UiPtCasesStatisticsUnitsType',
  fields: () => ({
    unitName: { type: new GraphQLNonNull(GraphQLString) },
    ps: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UiPtCasesStatisticsPsType))) },
    totalCrimes: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const UiPtCasesStatisticsType = new GraphQLObjectType({
  name: 'UiPtCasesStatisticsType',
  fields: () => ({
    totalCrimes: { type: new GraphQLNonNull(GraphQLInt) },
    mostCrimesPsName: { type: new GraphQLNonNull(GraphQLString) },
    leastCrimesPsName: { type: new GraphQLNonNull(GraphQLString) },
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UiPtCasesStatisticsUnitsType))) },
  }),
});

const FirAbstractTotalsType = new GraphQLObjectType({
  name: 'FirAbstractTotalsType',
  fields: () => ({
    underInvestigation: { type: new GraphQLNonNull(GraphQLInt) },
    pendingInTrial: { type: new GraphQLNonNull(GraphQLInt) },
    disposed: { type: new GraphQLNonNull(GraphQLInt) },
    acquittal: { type: new GraphQLNonNull(GraphQLInt) },
    conviction: { type: new GraphQLNonNull(GraphQLInt) },
    chargesheeted: { type: new GraphQLNonNull(GraphQLInt) },
    uiCommercialQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiIntermediateQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiSmallQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiCultivation: { type: new GraphQLNonNull(GraphQLInt) },
    ptSmallQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptIntermediateQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptCommercialQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptCultivation: { type: new GraphQLNonNull(GraphQLInt) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const FirAbstractYearTotalEntryType = new GraphQLObjectType({
  name: 'FirAbstractYearTotalEntryType',
  fields: () => ({
    year: { type: new GraphQLNonNull(GraphQLString) },
    underInvestigation: { type: new GraphQLNonNull(GraphQLInt) },
    pendingInTrial: { type: new GraphQLNonNull(GraphQLInt) },
    disposed: { type: new GraphQLNonNull(GraphQLInt) },
    acquittal: { type: new GraphQLNonNull(GraphQLInt) },
    conviction: { type: new GraphQLNonNull(GraphQLInt) },
    chargesheeted: { type: new GraphQLNonNull(GraphQLInt) },
    uiCommercialQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiIntermediateQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiSmallQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    uiCultivation: { type: new GraphQLNonNull(GraphQLInt) },
    ptSmallQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptIntermediateQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptCommercialQuantity: { type: new GraphQLNonNull(GraphQLInt) },
    ptCultivation: { type: new GraphQLNonNull(GraphQLInt) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const FirAbstractRowType = new GraphQLObjectType({
  name: 'FirAbstractRowType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    children: { type: new GraphQLList(new GraphQLNonNull(FirAbstractRowType)) },
    totalsByYear: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FirAbstractYearTotalEntryType))) },
    grandTotals: { type: new GraphQLNonNull(FirAbstractTotalsType) },
  }),
});

export const FirsAbstractType = new GraphQLObjectType({
  name: 'FirAbstractType',
  fields: () => ({
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FirAbstractRowType))) },
  }),
});

const TopPerformingRegionType = new GraphQLObjectType({
  name: 'TopPerformingRegionType',
  fields: () => ({
    unit: { type: new GraphQLNonNull(GraphQLString) },
    totalFirs: { type: new GraphQLNonNull(GraphQLInt) },
    totalArrests: { type: new GraphQLNonNull(GraphQLInt) },
    totalQuantity: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const DrugWiseAnalysisType = new GraphQLObjectType({
  name: 'DrugWiseAnalysisType',
  fields: () => ({
    drug: { type: new GraphQLNonNull(GraphQLString) },
    totalFirs: { type: new GraphQLNonNull(GraphQLInt) },
    totalQuantity: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const MonthlyTrendsType = new GraphQLObjectType({
  name: 'MonthlyTrendsType',
  fields: () => ({
    month: { type: new GraphQLNonNull(GraphQLString) },
    totalFirs: { type: new GraphQLNonNull(GraphQLInt) },
    totalArrests: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const OverviewStatisticsType = new GraphQLObjectType({
  name: 'OverviewStatisticsType',
  fields: () => ({
    topPerformingRegions: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TopPerformingRegionType))) },
    drugWiseAnalysis: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DrugWiseAnalysisType))) },
    monthlyTrends: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MonthlyTrendsType))) },
  }),
});
