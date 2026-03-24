import { GraphQLEnumType } from 'graphql';

const FirSortByEnumType = new GraphQLEnumType({
  name: 'FirSortByEnumType',
  values: {
    id: { value: 'id' },
    unit: { value: 'unit' },
    ps: { value: 'ps' },
    year: { value: 'year' },
    firNumber: { value: 'firNumber' },
    firRegNum: { value: 'firRegNum' },
    section: { value: 'section' },
    firType: { value: 'firType' },
    crimeType: { value: 'crimeType' },
    crimeRegDate: { value: 'crimeRegDate' },
    majorHead: { value: 'majorHead' },
    minorHead: { value: 'minorHead' },
    ioName: { value: 'ioName' },
    ioRank: { value: 'ioRank' },
    briefFacts: { value: 'briefFacts' },
    noOfAccusedInvolved: { value: 'noOfAccusedInvolved' },
    accusedDetails: { value: 'accusedDetails' },
    propertyDetails: { value: 'propertyDetails' },
    moSeizuresDetails: { value: 'moSeizuresDetails' },
    drugWithQuantity: { value: 'drugWithQuantity' },
    caseClassification: { value: 'caseClassification' },
    caseStatus: { value: 'caseStatus' },
    stipulatedPeriodForCS: { value: 'stipulatedPeriodForCS' },
    chargesheets: { value: 'chargesheets' },
    documents: { value: 'documents' },
    firCopy: { value: 'firCopy' },
    firCopyUrl: { value: 'firCopyUrl' },
    propertyDocuments: { value: 'propertyDocuments' },
    irDocuments: { value: 'irDocuments' },
  },
});

export default FirSortByEnumType;
