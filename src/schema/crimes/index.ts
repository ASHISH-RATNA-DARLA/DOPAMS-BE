// import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
// import PaginationType from 'schema/pagination/pagination';
// import { getPersonByAccusedNumber } from './services';
// import { SuspectType } from 'schema/user/suspect';

// export const CrimeType = new GraphQLObjectType({
//   name: 'CrimeType',
//   fields: () => ({
//     id: {
//       type: new GraphQLNonNull(GraphQLID),
//       resolve: obj => obj.crime_id,
//     },
//     accusedNumber: {
//       type: GraphQLString,
//       resolve: obj => obj.accused_no,
//     },
//     accused: {
//       type: SuspectType,
//       resolve: obj => getPersonByAccusedNumber(obj.accused_no),
//     },
//     firNumber: {
//       type: GraphQLString,
//       resolve: obj => obj.fir_no,
//     },
//     year: {
//       type: GraphQLString,
//       resolve: obj => obj.year,
//     },
//     sectionOfLaw: {
//       type: GraphQLString,
//       resolve: obj => obj.sec_of_law,
//     },
//     policeStation: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_ps,
//     },
//     district: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_district,
//     },
//     state: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_state,
//     },
//     modusOperandi: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_mo,
//     },
//     majorHead: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_major_head,
//     },
//     propertyLost: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_property_lost,
//     },
//     offencePhone: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_phone,
//     },
//     offenceEmail: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_email,
//     },
//     offenceFacebook: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_facebook,
//     },
//     offenceOtherSocialMedia: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_other_social_media,
//     },
//     offenceBankAccount: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_bank_account,
//     },
//     offenceBankName: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_bank_name,
//     },
//     offenceBankState: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_bank_state,
//     },
//     offenceBankDistrict: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_bank_district,
//     },
//     offenceIfscCode: {
//       type: GraphQLString,
//       resolve: obj => obj.offence_ifsc_code,
//     },
//     remarks: {
//       type: GraphQLString,
//       resolve: obj => obj.remarks,
//     },
//     createdDate: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_crtd_date,
//     },
//     modifiedDate: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_mdfd_date,
//     },
//     createdByUser: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_crtd_user,
//     },
//     modifiedByUser: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_mdfd_user,
//     },
//     walletInfo: {
//       type: GraphQLString,
//       resolve: obj => obj.wallet_info,
//     },
//     firContents: {
//       type: GraphQLString,
//       resolve: obj => obj.fir_contents,
//     },
//     materialSeized: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_material_seized,
//     },
//     personCategory: {
//       type: GraphQLString,
//       resolve: obj => obj.crime_personcategory,
//     },
//     firRegistrationNumber: {
//       type: GraphQLString,
//       resolve: obj => obj.fir_reg_num,
//     },
//     drugType: {
//       type: GraphQLString,
//       resolve: obj => obj.drug_type,
//     },
//     personCategorySearch: {
//       type: GraphQLString,
//       resolve: obj => obj.person_category_search,
//     },
//     lastModifiedUser: {
//       type: GraphQLString,
//       resolve: obj => obj.mdfd_user,
//     },
//     deportedDate: {
//       type: GraphQLString,
//       resolve: obj => obj.deported_date,
//     },
//     deportedCountry: {
//       type: GraphQLString,
//       resolve: obj => obj.deported_country,
//     },
//     chargeSheetRemarks: {
//       type: GraphQLString,
//       resolve: obj => obj.charge_sheet_remarks,
//     },
//     confessionStatement: {
//       type: GraphQLString,
//       resolve: obj => obj.confession_statement,
//     },
//     remandReport: {
//       type: GraphQLString,
//       resolve: obj => obj.remand_report,
//     },
//     irStatus: {
//       type: GraphQLString,
//       resolve: obj => obj.ir_status,
//     },
//     irContent: {
//       type: GraphQLString,
//       resolve: obj => obj.ir_content,
//     },
//     fslReport: {
//       type: GraphQLString,
//       resolve: obj => obj.fsl_report,
//     },
//     seizure: {
//       type: GraphQLString,
//       resolve: obj => obj.seizure,
//     },
//     firStatus: {
//       type: GraphQLString,
//       resolve: obj => obj.fir_status,
//     },
//     caseNumber: {
//       type: GraphQLString,
//       resolve: obj => obj.cc_no__,
//     },
//   }),
// });

// const CrimeStatisticsBreakdownType = new GraphQLObjectType({
//   name: 'CrimeStatisticsBreakdownType',
//   fields: () => ({
//     status: {
//       type: GraphQLString,
//       resolve: statistics => statistics.status,
//     },
//     numberOfCrimes: {
//       type: GraphQLInt,
//       resolve: statistics => statistics.numberOfCrimes,
//     },
//   }),
// });

// export const CrimesStatisticsType = new GraphQLObjectType({
//   name: 'CrimesStatisticsType',
//   fields: () => ({
//     crimeStatisticsBreakdownByStatus: {
//       type: new GraphQLList(CrimeStatisticsBreakdownType),
//       resolve: statistics => statistics.crimeStatisticsBreakdownByStatus,
//     },
//   }),
// });

// export const CrimesType = new GraphQLObjectType({
//   name: 'CrimesType',
//   fields: () => ({
//     nodes: {
//       type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CrimeType))),
//       resolve: obj => obj.crimes,
//     },
//     pageInfo: {
//       type: new GraphQLNonNull(PaginationType),
//       resolve: obj => obj.pageInfo,
//     },
//     statistics: {
//       type: new GraphQLNonNull(CrimesStatisticsType),
//       resolve: obj => obj.statistics,
//     },
//   }),
// });

// export { default as services } from './services';
