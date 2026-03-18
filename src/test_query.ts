import { prisma } from './datasources/prisma';

async function main() {
  try {
    const firsMvCount = await prisma.$queryRawUnsafe<{ count: number }[]>(
      'SELECT COUNT(*)::int as count FROM firs_mv;'
    );
    console.log('firs_mv count:', firsMvCount[0].count);

    const accusedsMvCount = await prisma.$queryRawUnsafe<{ count: number }[]>(
      'SELECT COUNT(*)::int as count FROM accuseds_mv;'
    );
    console.log('accuseds_mv count:', accusedsMvCount[0].count);

    const disposalCount = await prisma.disposal.count();
    console.log('disposal count:', disposalCount);

    const sampleFirsMv = await prisma.$queryRawUnsafe<any[]>(
      'SELECT "crimeRegDate", "caseClassification" FROM firs_mv LIMIT 3;'
    );
    console.log('sample firs_mv:', sampleFirsMv);

    const drugSeizures = await prisma.$queryRawUnsafe<any[]>(
      'SELECT SUM(seizure_worth) as total_worth FROM brief_facts_drug;'
    );
    console.log('brief_facts_drug seizure_worth sum:', drugSeizures[0]);

    const accStatus = await prisma.$queryRawUnsafe<any[]>(
      'SELECT "accusedStatus", count(*) FROM accuseds_mv GROUP BY "accusedStatus" LIMIT 5;'
    );
    console.log('accuseds_mv accusedStatus group:', accStatus);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
