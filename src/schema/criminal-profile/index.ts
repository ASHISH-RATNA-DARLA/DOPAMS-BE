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
import { DocumentType } from 'schema/misc/document';
import {
  AssociateDetailsType,
  ConsumerDetailsType,
  DefenceCounselType,
  DopamsLinksType,
  FamilyHistoryType,
  FinancialHistoryType,
  LocalContactsType,
  ModusOperandiType,
  PreviousOffencesConfessedType,
  RegularHabitsType,
  ShelterType,
  SimDetailsType,
  TypesOfDrugsType,
} from 'schema/firs/interrogation_report';

const CrimeChargesheetActType = new GraphQLObjectType({
  name: 'CrimeChargesheetActType',
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

const CrimeChargesheetAccusedType = new GraphQLObjectType({
  name: 'CrimeChargesheetAccusedType',
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

const CrimeChargesheetType = new GraphQLObjectType({
  name: 'CrimeChargesheetType',
  fields: () => ({
    id: { type: GraphQLID },
    chargesheetNo: { type: GraphQLString },
    chargesheetNoIcjs: { type: GraphQLString },
    chargesheetDate: { type: GraphQLString },
    chargesheetType: { type: GraphQLString },
    courtName: { type: GraphQLString },
    isCcl: { type: GraphQLBoolean },
    isEsigned: { type: GraphQLBoolean },
    dateCreated: { type: GraphQLString },
    dateModified: { type: GraphQLString },
    acts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimeChargesheetActType))) },
    accuseds: { type: CrimeChargesheetAccusedType },
  }),
});

const InterrogationReportType = new GraphQLObjectType({
  name: 'InterrogationReportType',
  fields: () => ({
    interrogationReportId: { type: GraphQLString },
    crimeId: { type: GraphQLString },
    personId: { type: GraphQLString },
    physicalBeard: { type: GraphQLString },
    physicalBuild: { type: GraphQLString },
    physicalBurnMarks: { type: GraphQLString },
    physicalColor: { type: GraphQLString },
    physicalDeformitiesOrPeculiarities: { type: GraphQLString },
    physicalDeformities: { type: GraphQLString },
    physicalEar: { type: GraphQLString },
    physicalEyes: { type: GraphQLString },
    physicalFace: { type: GraphQLString },
    physicalHair: { type: GraphQLString },
    physicalHeight: { type: GraphQLString },
    physicalIdentificationMarks: { type: GraphQLString },
    physicalLanguageOrDialect: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    physicalLeucoderma: { type: GraphQLString },
    physicalMole: { type: GraphQLString },
    physicalMustache: { type: GraphQLString },
    physicalNose: { type: GraphQLString },
    physicalScar: { type: GraphQLString },
    physicalTattoo: { type: GraphQLString },
    physicalTeeth: { type: GraphQLString },
    socioLivingStatus: { type: GraphQLString },
    socioMaritalStatus: { type: GraphQLString },
    socioEducation: { type: GraphQLString },
    socioOccupation: { type: GraphQLString },
    socioIncomeGroup: { type: GraphQLString },
    offenceTime: { type: GraphQLString },
    otherOffenceTime: { type: GraphQLString },
    shareOfAmountSpent: { type: GraphQLString },
    otherShareOfAmountSpent: { type: GraphQLString },
    shareRemarks: { type: GraphQLString },
    isInJail: { type: GraphQLBoolean },
    fromWhereSentInJail: { type: GraphQLString },
    inJailCrimeNum: { type: GraphQLString },
    inJailDistUnit: { type: GraphQLString },
    isOnBail: { type: GraphQLBoolean },
    fromWhereSentOnBail: { type: GraphQLString },
    onBailCrimeNum: { type: GraphQLString },
    dateOfBail: { type: GraphQLString },
    isAbsconding: { type: GraphQLBoolean },
    wantedInPoliceStation: { type: GraphQLString },
    abscondingCrimeNum: { type: GraphQLString },
    isNormalLife: { type: GraphQLBoolean },
    ekingLivelihoodByLaborWork: { type: GraphQLString },
    isRehabilitated: { type: GraphQLBoolean },
    rehabilitationDetails: { type: GraphQLString },
    isDead: { type: GraphQLBoolean },
    deathDetails: { type: GraphQLString },
    isFacingTrial: { type: GraphQLBoolean },
    facingTrialPsName: { type: GraphQLString },
    facingTrialCrimeNum: { type: GraphQLString },
    otherRegularHabits: { type: GraphQLString },
    otherIndulgenceBeforeOffence: { type: GraphQLString },
    timeSinceModusOperandi: { type: GraphQLString },
    dateCreated: { type: GraphQLString },
    dateModified: { type: GraphQLString },
    associateDetails: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AssociateDetailsType))) },
    consumerDetails: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ConsumerDetailsType))) },
    defenceCounsel: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DefenceCounselType))) },
    dopamsLinks: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DopamsLinksType))) },
    familyHistory: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FamilyHistoryType))) },
    financialHistory: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(FinancialHistoryType))) },
    localContacts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(LocalContactsType))) },
    modusOperandi: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ModusOperandiType))) },
    previousOffencesConfessed: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PreviousOffencesConfessedType))),
    },
    regularHabits: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RegularHabitsType))) },
    shelter: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ShelterType))) },
    simDetails: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SimDetailsType))) },
    typesOfDrugs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TypesOfDrugsType))) },
  }),
});

export const CrimeType = new GraphQLObjectType({
  name: 'CrimeType',
  fields: () => ({
    id: { type: GraphQLID },
    unit: { type: GraphQLString },
    ps: { type: GraphQLString },
    year: { type: GraphQLInt },
    firNumber: { type: GraphQLString },
    firRegNum: { type: GraphQLString },
    firType: { type: GraphQLString },
    section: { type: GraphQLString },
    crimeRegDate: { type: GraphQLString },
    majorHead: { type: GraphQLString },
    minorHead: { type: GraphQLString },
    crimeType: { type: GraphQLString },
    ioName: { type: GraphQLString },
    ioRank: { type: GraphQLString },
    briefFacts: { type: GraphQLString },
    accusedCode: { type: GraphQLString },
    accusedType: { type: GraphQLString },
    accusedStatus: { type: GraphQLString },
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
    caseStatus: { type: GraphQLString },
    chargesheets: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimeChargesheetType))) },
    interrogationReports: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(InterrogationReportType))) },
  }),
});

const CrimesInvolvedType = new GraphQLObjectType({
  name: 'CrimesInvolvedType',
  fields: () => ({
    crimeId: { type: GraphQLString },
    accusedId: { type: GraphQLString },
    accusedRole: { type: GraphQLString },
  }),
});

export const CriminalProfileType = new GraphQLObjectType({
  name: 'CriminalProfile',
  fields: () => ({
    id: { type: GraphQLID },
    alias: { type: GraphQLString },
    name: { type: GraphQLString },
    surname: { type: GraphQLString },
    fullName: { type: GraphQLString },
    relationType: { type: GraphQLString },
    relativeName: { type: GraphQLString },
    gender: { type: GraphQLString },
    isDied: { type: GraphQLBoolean },
    dateOfBirth: { type: GraphQLString },
    age: { type: GraphQLInt },
    occupation: { type: GraphQLString },
    educationQualification: { type: GraphQLString },
    caste: { type: GraphQLString },
    subCaste: { type: GraphQLString },
    religion: { type: GraphQLString },
    domicile: { type: GraphQLString },
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
    // identityDocuments: new schema returns {id, identityType, identityNumber, filePath}
    // mapped to the existing IdentityDocumentType with field resolvers below
    identityDocuments: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IdentityDocumentType))),
      resolve: async profile => {
        if (!profile.identityDocuments) return [];
        const docs =
          typeof profile.identityDocuments === 'string'
            ? JSON.parse(profile.identityDocuments)
            : profile.identityDocuments;
        if (!docs || docs.length === 0) return [];

        const { prisma } = require('datasources/prisma');
        const dbFiles = await prisma.file.findMany({
          where: { parentId: profile.id, isDownloaded: true },
          select: { filePath: true },
        });
        const downloadedPaths = new Set(dbFiles.map((f: any) => f.filePath));

        // Map new schema shape {id, identityType, identityNumber, filePath} →
        // GraphQL shape {type, link, identityType, identityNumber}
        return (docs ?? [])
          .map((doc: any) => {
            let path = doc.filePath ?? doc.file_path ?? doc.link ?? '';
            if (path && !path.startsWith('http')) {
              const baseUrl = process.env.TOMCAT_FILE_API_URL || '';
              const separator = path.startsWith('/') || baseUrl.endsWith('/') ? '' : '/';
              path = `${baseUrl}${separator}${path}`;
            }
            return {
              type: doc.source_field ?? doc.type ?? 'IDENTITY_DETAILS',
              link: path,
              identityType: doc.identityType ?? doc.identity_type ?? null,
              identityNumber: doc.identityNumber ?? doc.identity_number ?? null,
              isDownloaded:
                doc.is_downloaded === true ||
                doc.isDownloaded === true ||
                downloadedPaths.has(doc.filePath ?? doc.file_path ?? doc.link),
            };
          })
          .filter((doc: any) => doc.isDownloaded);
      },
    },
    documents: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DocumentType))),
      resolve: async profile => {
        if (!profile.documents) return [];
        const docs = typeof profile.documents === 'string' ? JSON.parse(profile.documents) : profile.documents;
        if (!docs || docs.length === 0) return [];

        const { prisma } = require('datasources/prisma');
        const dbFiles = await prisma.file.findMany({
          where: { parentId: profile.id, isDownloaded: true },
          select: { filePath: true },
        });
        const downloadedPaths = new Set(dbFiles.map((f: any) => f.filePath));

        // Map new schema shape {id, filePath} → DocumentType shape {link, name}
        return (docs ?? [])
          .map((doc: any) => {
            let path = doc.filePath ?? doc.file_path ?? doc.link ?? '';
            if (path && !path.startsWith('http')) {
              const baseUrl = process.env.TOMCAT_FILE_API_URL || '';
              const separator = path.startsWith('/') || baseUrl.endsWith('/') ? '' : '/';
              path = `${baseUrl}${separator}${path}`;
            }
            return {
              link: path,
              name: doc.name ?? doc.notes ?? null,
              isDownloaded:
                doc.is_downloaded === true ||
                doc.isDownloaded === true ||
                downloadedPaths.has(doc.filePath ?? doc.file_path ?? doc.link),
            };
          })
          .filter((doc: any) => doc.isDownloaded);
      },
    },
    // crimes: new schema only has {id, firNumber, crimeRegDate} in criminal_profiles_mv.
    // Full crime details (ps, unit, caseStatus, chargesheets, etc.) are fetched from
    // accuseds_mv by the service layer and merged here.
    crimes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimeType))),
      resolve: profile => profile.crimes ?? [],
    },
    associatedDrugs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    latestCrimeNo: { type: GraphQLString },
    latestCrimeId: { type: GraphQLString },
    noOfCrimes: { type: GraphQLInt, resolve: profile => Number(profile.noOfCrimes) },
    arrestCount: { type: GraphQLInt, resolve: profile => Number(profile.arrestCount) },
    lastArrestDate: { type: GraphQLString },
    previouslyInvolvedCases: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PreviouslyInvolvedCrimesType))),
    },
    DOPAMSLinks: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    counselled: { type: GraphQLString },
    socialMedia: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    RTAData: { type: GraphQLString },
    bankAccountDetails: { type: GraphQLString },
    passportDetails_Foreigners: { type: GraphQLString },
    purposeOfVISA_Foreigners: { type: GraphQLString },
    validityOfVISA_Foreigners: { type: GraphQLString },
    localaddress_Foreigners: { type: GraphQLString },
    nativeAddress_Foreigners: { type: GraphQLString },
    statusOfTheAccused: { type: GraphQLString },
    historySheet: { type: GraphQLString },
    propertyForfeited: { type: GraphQLString },
    PITNDPSInitiated: { type: GraphQLString },
    crimesInvolved: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimesInvolvedType))) },
    accusedRoles: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    photo: { type: GraphQLString },
  }),
});

export const PreviouslyInvolvedCrimesType = new GraphQLObjectType({
  name: 'PreviouslyInvolvedCrimesType',
  fields: () => ({
    id: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

export const IdentityDocumentType = new GraphQLObjectType({
  name: 'IdentityDocumentType',
  fields: () => ({
    type: { type: new GraphQLNonNull(GraphQLString) },
    link: { type: new GraphQLNonNull(GraphQLString) },
    identityType: { type: GraphQLString },
    identityNumber: { type: GraphQLString },
    isDownloaded: { type: GraphQLBoolean },
  }),
});

export const CriminalProfilesType = new GraphQLObjectType({
  name: 'CriminalProfilesType',
  fields: () => ({
    nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CriminalProfileType))) },
    pageInfo: { type: new GraphQLNonNull(PaginationType) },
  }),
});
