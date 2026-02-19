// import { getPrismaInstance } from 'datasources/prisma';
// import { CrimeEntity } from 'interfaces/crime';
// import { runQueryOnNdpsDatasource } from 'datasources/ndpsDatasource';

// const prisma = getPrismaInstance();

// export const getCrime = async (crime_id: string): Promise<CrimeEntity | null> => {
//   return prisma.crime_info.findUnique({
//     where: { crime_id },
//   });
// };

// export const getCrimes = async (
//   cursor?: string,
//   limit: number = 10
// ): Promise<{ crimes: CrimeEntity[]; pageInfo: any; statistics: any }> => {
//   const result = await prisma.$transaction([
//     prisma.crime_info.count({}),
//     prisma.crime_info.findMany({
//       skip: cursor ? 1 : 0,
//       take: limit ? limit + 1 : undefined,
//       cursor: cursor ? { crime_id: cursor } : undefined,
//     }),
//   ]);

//   const resultSet = result[1];
//   const hasNextPage = resultSet.length > (limit || 0);
//   if (hasNextPage) resultSet.pop();

//   const resultSetLength = resultSet.length;
//   const cursorNode = resultSetLength > 0 ? resultSet[resultSetLength - 1] : null;

//   const pageInfo = {
//     totalCount: result[0],
//     limit: limit || 0,
//     cursor: cursorNode ? cursorNode.crime_id : undefined,
//     hasNextPage,
//   };

//   const statistics = await generateCrimeStatistics();

//   return { crimes: resultSet, pageInfo, statistics };
// };

// export const generateCrimeStatistics = async () => {
//   const crimeStatusBreakdown = await prisma.crime_info.groupBy({
//     by: ['fir_status'],
//     _count: { crime_id: true },
//   });

//   const statistics = crimeStatusBreakdown.map(crimeStatusData => ({
//     status: crimeStatusData.fir_status,
//     numberOfCrimes: crimeStatusData._count.crime_id,
//   }));

//   return { crimeStatisticsBreakdownByStatus: statistics };
// };

// export const getCrimeByAccusedNumber = async (accused_no: string): Promise<CrimeEntity[] | null> => {
//   return prisma.crime_info.findMany({
//     where: { accused_no },
//   });
// };

// // Utility to fetch user details from person_87 table in another database
// export const getPersonByAccusedNumber = async (accused_no: string): Promise<any[]> => {
//   //   const query = 'SELECT * FROM person_87 WHERE accused_no = $1';
//   const query = 'SELECT * FROM person_87 ORDER BY RANDOM() LIMIT 1';
//   const res = await runQueryOnNdpsDatasource(query, [accused_no]);
//   return res[0];
// };

// export default {
//   getCrime,
//   getCrimes,
// };
