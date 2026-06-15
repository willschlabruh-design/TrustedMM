import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!', result);
    
    // Try to fetch a user count
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
