import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

// Family Member Type
export const FamilyMemberType = new GraphQLObjectType({
  name: 'FamilyMemberType',
  fields: () => ({
    name: { type: GraphQLString },
    address: { type: GraphQLString },
    mobileNo: { type: GraphQLString },
    occupation: { type: GraphQLString },
    relationType: { type: GraphQLString },
  }),
});

// Family Members Type
export const FamilyMembersType = new GraphQLObjectType({
  name: 'FamilyMembersType',
  fields: () => ({
    aunt: { type: FamilyMemberType },
    brother: { type: FamilyMemberType },
    daughter: { type: FamilyMemberType },
    father: { type: FamilyMemberType },
    fatherInLaw: { type: FamilyMemberType },
    friend: { type: FamilyMemberType },
    motherInLaw: { type: FamilyMemberType },
    mother: { type: FamilyMemberType },
    sister: { type: FamilyMemberType },
    son: { type: FamilyMemberType },
    uncle: { type: FamilyMemberType },
    wife: { type: FamilyMemberType },
  }),
});

// Associate Details Type
export const AssociateDetailsType = new GraphQLObjectType({
  name: 'AssociateDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    personId: { type: GraphQLString },
    gang: { type: GraphQLString },
    relation: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// Consumer Details Type
export const ConsumerDetailsType = new GraphQLObjectType({
  name: 'ConsumerDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    consumerPersonId: { type: GraphQLString },
    placeOfConsumption: { type: GraphQLString },
    otherSources: { type: GraphQLString },
    otherSourcesPhoneNo: { type: GraphQLString },
    aadharCardNumber: { type: GraphQLString },
    aadharCardNumberPhoneNo: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// Defence Counsel Type
export const DefenceCounselType = new GraphQLObjectType({
  name: 'DefenceCounselType',
  fields: () => ({
    id: { type: GraphQLString },
    distDivision: { type: GraphQLString },
    psCode: { type: GraphQLString },
    crimeNum: { type: GraphQLString },
    lawSection: { type: GraphQLString },
    scCcNum: { type: GraphQLString },
    defenceCounselAddress: { type: GraphQLString },
    defenceCounselPhone: { type: GraphQLString },
    assistance: { type: GraphQLString },
    defenceCounselPersonId: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// DOPAMS Links Type
export const DopamsLinksType = new GraphQLObjectType({
  name: 'DopamsLinksType',
  fields: () => ({
    id: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    dopamsData: { type: new GraphQLList(GraphQLString) },
  }),
});

// Family History Type
export const FamilyHistoryType = new GraphQLObjectType({
  name: 'FamilyHistoryType',
  fields: () => ({
    id: { type: GraphQLString },
    personId: { type: GraphQLString },
    relation: { type: GraphQLString },
    familyMemberPeculiarity: { type: GraphQLString },
    criminalBackground: { type: GraphQLBoolean },
    isAlive: { type: GraphQLBoolean },
    familyStayTogether: { type: GraphQLBoolean },
    value: { type: GraphQLString },
  }),
});

// Financial History Type
export const FinancialHistoryType = new GraphQLObjectType({
  name: 'FinancialHistoryType',
  fields: () => ({
    id: { type: GraphQLString },
    accountHolderPersonId: { type: GraphQLString },
    panNo: { type: GraphQLString },
    upiId: { type: GraphQLString },
    nameOfBank: { type: GraphQLString },
    accountNumber: { type: GraphQLString },
    branchName: { type: GraphQLString },
    ifscCode: { type: GraphQLString },
    immovablePropertyAcquired: { type: GraphQLString },
    movablePropertyAcquired: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// Local Contacts Type
export const LocalContactsType = new GraphQLObjectType({
  name: 'LocalContactsType',
  fields: () => ({
    id: { type: GraphQLString },
    personId: { type: GraphQLString },
    town: { type: GraphQLString },
    address: { type: GraphQLString },
    jurisdictionPs: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// Modus Operandi Type
export const ModusOperandiType = new GraphQLObjectType({
  name: 'ModusOperandiType',
  fields: () => ({
    id: { type: GraphQLString },
    crimeHead: { type: GraphQLString },
    crimeSubHead: { type: GraphQLString },
    modusOperandi: { type: GraphQLString },
  }),
});

// Previous Offences Confessed Type
export const PreviousOffencesConfessedType = new GraphQLObjectType({
  name: 'PreviousOffencesConfessedType',
  fields: () => ({
    id: { type: GraphQLString },
    arrestDate: { type: GraphQLString },
    arrestedBy: { type: GraphQLString },
    arrestPlace: { type: GraphQLString },
    crimeNum: { type: GraphQLString },
    distUnitDivision: { type: GraphQLString },
    gangMember: { type: GraphQLString },
    interrogatedBy: { type: GraphQLString },
    lawSection: { type: GraphQLString },
    othersIdentify: { type: GraphQLString },
    propertyRecovered: { type: GraphQLString },
    propertyStolen: { type: GraphQLString },
    psCode: { type: GraphQLString },
    remarks: { type: GraphQLString },
  }),
});

// Regular Habits Type
export const RegularHabitsType = new GraphQLObjectType({
  name: 'RegularHabitsType',
  fields: () => ({
    id: { type: GraphQLString },
    habit: { type: GraphQLString },
  }),
});

// Shelter Type
export const ShelterType = new GraphQLObjectType({
  name: 'ShelterType',
  fields: () => ({
    id: { type: GraphQLString },
    preparationOfOffence: { type: GraphQLString },
    afterOffence: { type: GraphQLString },
    regularResidency: { type: GraphQLString },
    remarks: { type: GraphQLString },
    otherRegularResidency: { type: GraphQLString },
  }),
});

// SIM Details Type
export const SimDetailsType = new GraphQLObjectType({
  name: 'SimDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    sdr: { type: GraphQLString },
    imei: { type: GraphQLString },
    trueCallerName: { type: GraphQLString },
    personId: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});

// Types of Drugs Type
export const TypesOfDrugsType = new GraphQLObjectType({
  name: 'TypesOfDrugsType',
  fields: () => ({
    id: { type: GraphQLString },
    typeOfDrug: { type: GraphQLString },
    quantity: { type: GraphQLString },
    purchaseAmountInInr: { type: GraphQLString },
    modeOfPayment: { type: GraphQLString },
    modeOfTransport: { type: GraphQLString },
    supplierPersonId: { type: GraphQLString },
    receiversPersonId: { type: GraphQLString },
    supplierValue: { type: GraphQLString },
    receiverValue: { type: GraphQLString },
  }),
});

// IR Details Type (Main Type)
export const IrDetailsType = new GraphQLObjectType({
  name: 'IrDetailsType',
  fields: () => ({
    id: { type: GraphQLString },
    personId: { type: GraphQLString },
    value: { type: GraphQLString },
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
    physicalLanguageOrDialect: { type: new GraphQLList(GraphQLString) },
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
    familyMembers: { type: FamilyMembersType },
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
