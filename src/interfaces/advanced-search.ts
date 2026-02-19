export interface AdvancedSearch {
  // crimes table
  id: string;
  psCode: string;
  firNum: string;
  firRegNum: string;
  firType: string;
  sections: string;
  firDate: string;
  caseClass: string;
  caseStatus: string;
  stipulatedPeriodForCS: string;
  majorHead: string;
  minorHead: string;
  crimeType: string;
  ioName: string;
  ioRank: string;
  briefFacts: string;

  // accused table
  accusedCode: string;
  type: string;
  seqNum: string;
  isCCL: boolean;
  beard: string;
  build: string;
  color: string;
  ear: string;
  eyes: string;
  face: string;
  hair: string;
  height: string;
  leucoderma: string;
  mole: string;
  mustache: string;
  nose: string;
  teeth: string;

  // brief_facts_accused
  accusedType: string;
  accusedStatus: string;

  // brief_facts_drugs
  drugType: string;
  drugQuantityKg: string;
  drugQuantityMl: string;
  drugQuantityCount: string;
  drugWorth: string;

  // heirarchy table
  psName: string;
  circleCode: string;
  circleName: string;
  sdpoCode: string;
  sdpoName: string;
  subZoneCode: string;
  subZoneName: string;
  distCode: string;
  distName: string;
  rangeCode: string;
  rangeName: string;
  zoneCode: string;
  zoneName: string;
  adgCode: string;
  adgName: string;

  // person table
  name: string;
  surname: string;
  alias: string;
  fullName: string;
  relationType: string;
  relativeName: string;
  gender: string;
  isDied: boolean;
  dateOfBirth: string;
  age: string;
  occupation: string;
  educationQualification: string;
  caste: string;
  subCaste: string;
  religion: string;
  domicile: string;
  nationality: string;
  designation: string;
  placeOfWork: string;
  presentHouseNo: string;
  presentStreetRoadNo: string;
  presentWardColony: string;
  presentLandmarkMilestone: string;
  presentLocalityVillage: string;
  presentAreaMandal: string;
  presentDistrict: string;
  presentStateUt: string;
  presentCountry: string;
  presentResidencyType: string;
  presentPinCode: string;
  presentJurisdictionPs: string;
  presentAddress: string;
  permanentHouseNo: string;
  permanentStreetRoadNo: string;
  permanentWardColony: string;
  permanentLandmarkMilestone: string;
  permanentLocalityVillage: string;
  permanentAreaMandal: string;
  permanentDistrict: string;
  permanentStateUt: string;
  permanentCountry: string;
  permanentResidencyType: string;
  permanentPinCode: string;
  permanentJurisdictionPs: string;
  permanentAddress: string;
  phoneNumber: string;
  countryCode: string;
  emailId: string;
}

export interface FirAdvancedFilterInput {
  field: keyof AdvancedSearch;
  operator: 'equals' | 'gte' | 'gt' | 'lte' | 'lt' | 'contains' | 'between' | 'startsWith' | 'endsWith';
  connector: 'and' | 'or';
  value?: any;
  value2?: any; // for 'between'
}
