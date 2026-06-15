import { prisma } from './src/lib/prisma';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
