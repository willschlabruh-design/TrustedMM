import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const settingsCount = await prisma.userSettings.count();
    console.log('userSettings: OK (' + settingsCount + ' rows)');
  } catch (err) {
    console.error('userSettings: FAIL —', err instanceof Error ? err.message : err);
  }

  try {
    const auditCount = await prisma.auditLog.count();
    console.log('auditLog: OK (' + auditCount + ' rows)');
  } catch (err) {
    console.error('auditLog: FAIL —', err instanceof Error ? err.message : err);
  }

  await prisma.$disconnect();
}

main();
