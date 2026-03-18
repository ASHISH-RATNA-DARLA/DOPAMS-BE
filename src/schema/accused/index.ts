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
import { DrugDetailsType, DisposalDetailsType } from 'schema/firs';
import { DrugTypeGroupType } from 'schema/firs/seizures';

export const AccusedType = new GraphQLObjectType({
  name: 'AccusedType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    unit: { type: GraphQLString },
    ps: { type: GraphQLString },
    year: { type: GraphQLInt },
    crimeId: { type: GraphQLString },
    firNumber: { type: GraphQLString },
    firRegNum: { type: GraphQLString },
    section: { type: GraphQLString },
    crimeRegDate: { type: GraphQLString },
    briefFacts: { type: GraphQLString },
    accusedCode: { type: GraphQLString },
    seqNum: { type: GraphQLString },
    isCCL: { type: GraphQLBoolean },
    beard: { type: GraphQLString },
    build: { type: GraphQLString },
    color: { type: GraphQLString },
    ear: { type: GraphQLString },
    eyes: { type: GraphQLString },
    face: { type: GraphQLString },
    hair: { type: GraphQLString },
    height: { type: GraphQLString },
    leucoderma: { type: GraphQLString },
    mole: { type: GraphQLString },
    mustache: { type: GraphQLString },
    nose: { type: GraphQLString },
    teeth: { type: GraphQLString },
    // accusedStatus is now a normalized value from the MV:
    // 'Arrested' | 'Absconding' | 'Issued Notice' | 'Unknown'
    accusedStatus: { type: GraphQLString },
    // accusedStatusRaw is the raw, un-normalized status string from the source data
    accusedStatusRaw: { type: GraphQLString }, // NEW
    accusedType: { type: GraphQLString },
    // accusedRole is the role in the crime (peddler, supplier, transporter, etc.)
    // sourced from brief_facts_accused.accused_type via the MV
    accusedRole: { type: GraphQLString }, // NEW
    noOfAccusedInvolved: { type: GraphQLInt },
    fullName: { type: GraphQLString },
    accusedDetails: { type: new GraphQLList(new GraphQLNonNull(CrimeDetailsType)) },
    personId: { type: GraphQLString },
    parentage: { type: GraphQLString },
    relationType: { type: GraphQLString },
    gender: { type: GraphQLString },
    isDied: { type: GraphQLBoolean },
    dateOfBirth: { type: GraphQLString },
    age: { type: GraphQLInt },
    domicile: { type: GraphQLString },
    occupation: { type: GraphQLString },
    educationQualification: { type: GraphQLString },
    caste: { type: GraphQLString },
    subCaste: { type: GraphQLString },
    religion: { type: GraphQLString },
    nationality: { type: GraphQLString },
    designation: { type: GraphQLString },
    placeOfWork: { type: GraphQLString },
    presentHouseNo: { type: GraphQLString },
    presentStreetRoadNo: { type: GraphQLString },
    presentWardColony: { type: GraphQLString },
    presentLandmarkMilestone: { type: GraphQLString },
    presentLocalityVillage: { type: GraphQLString },
    presentAreaMandal: { type: GraphQLString },
    presentDistrict: { type: GraphQLString },
    presentStateUt: { type: GraphQLString },
    presentCountry: { type: GraphQLString },
    presentResidencyType: { type: GraphQLString },
    presentPinCode: { type: GraphQLString },
    presentJurisdictionPs: { type: GraphQLString },
    permanentHouseNo: { type: GraphQLString },
    permanentStreetRoadNo: { type: GraphQLString },
    permanentWardColony: { type: GraphQLString },
    permanentLandmarkMilestone: { type: GraphQLString },
    permanentLocalityVillage: { type: GraphQLString },
    permanentAreaMandal: { type: GraphQLString },
    permanentDistrict: { type: GraphQLString },
    permanentStateUt: { type: GraphQLString },
    permanentCountry: { type: GraphQLString },
    permanentResidencyType: { type: GraphQLString },
    permanentPinCode: { type: GraphQLString },
    permanentJurisdictionPs: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    countryCode: { type: GraphQLString },
    emailId: { type: GraphQLString },
    noOfCrimes: { type: GraphQLInt },
    previouslyInvolvedCases: { type: new GraphQLList(new GraphQLNonNull(CrimeDetailsType)) },
    drugWithQuantity: { type: new GraphQLList(new GraphQLNonNull(DrugDetailsType)) },
    caseClassification: { type: GraphQLString },
    caseStatus: { type: GraphQLString },
    presentAddress: { type: GraphQLString },
    permanentAddress: { type: GraphQLString },
    disposalDetails: { type: new GraphQLList(new GraphQLNonNull(DisposalDetailsType)) },
  }),
});

const CrimeDetailsType = new GraphQLObjectType({
  name: 'CrimeDetailsType',
  fields: () => ({
    id: { type: GraphQLID },
    value: { type: GraphQLString },
  }),
});

export const AccusedsType = new GraphQLObjectType({
  name: 'AccusedsType',
  fields: () => ({
    nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AccusedType))) },
    pageInfo: { type: new GraphQLNonNull(PaginationType) },
  }),
});

export const AccusedStatisticsType = new GraphQLObjectType({
  name: 'AccusedStatisticsType',
  fields: () => ({
    totalAccused: { type: new GraphQLNonNull(GraphQLInt) },
    accusedStatisticsBreakdownByAge: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByDomicile: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByCaseClass: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByGender: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByCaseStatus: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByAccusedType: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByAccusedStatus: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByNationality: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByNativeState: { type: new GraphQLNonNull(StatisticsListType) },
    accusedStatisticsBreakdownByAccusedRole: { type: new GraphQLNonNull(StatisticsListType) },
  }),
});

export const AccusedFilterValuesType = new GraphQLObjectType({
  name: 'AccusedFilterValuesType',
  fields: () => ({
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt))) },
    caseClass: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    caseStatus: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    accusedStatus: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    accusedType: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    domicile: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    ps: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    gender: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    nationality: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    state: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    drugTypes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DrugTypeGroupType))) },
  }),
});

const AccusedAbstractTotalsType = new GraphQLObjectType({
  name: 'AccusedAbstractTotalsType',
  fields: () => ({
    totalCases: { type: new GraphQLNonNull(GraphQLInt) },
    totalInvolved: { type: new GraphQLNonNull(GraphQLInt) },
    totalArrested: { type: new GraphQLNonNull(GraphQLInt) },
    totalAbsconding: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const AccusedAbstractYearTotalEntryType = new GraphQLObjectType({
  name: 'AccusedAbstractYearTotalEntryType',
  fields: () => ({
    year: { type: new GraphQLNonNull(GraphQLString) },
    totalCases: { type: new GraphQLNonNull(GraphQLInt) },
    totalInvolved: { type: new GraphQLNonNull(GraphQLInt) },
    totalArrested: { type: new GraphQLNonNull(GraphQLInt) },
    totalAbsconding: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const AccusedAbstractRowType = new GraphQLObjectType({
  name: 'AccusedAbstractRowType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    children: { type: new GraphQLList(new GraphQLNonNull(AccusedAbstractRowType)) },
    totalsByYear: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AccusedAbstractYearTotalEntryType))) },
    grandTotals: { type: new GraphQLNonNull(AccusedAbstractTotalsType) },
  }),
});

export const AccusedAbstractType = new GraphQLObjectType({
  name: 'AccusedAbstractType',
  fields: () => ({
    years: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    units: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AccusedAbstractRowType))) },
  }),
});
