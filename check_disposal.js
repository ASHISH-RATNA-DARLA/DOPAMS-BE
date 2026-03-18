const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://dev_dopamas:ADevingpjveD2rkdoast4s@192.168.103.106:5432/dev-2?schema=public'
    }
  }
});

(async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT DISTINCT disposal_type, COUNT(*) as count
      FROM disposal 
      GROUP BY disposal_type 
      ORDER BY COUNT(*) DESC
    `;
    result.forEach(row => {
      console.log(`${row.disposal_type} -> ${Number(row.count)}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
