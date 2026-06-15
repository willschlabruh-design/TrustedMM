import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  
  // Mask the password for security
  let maskedUrl = dbUrl;
  if (dbUrl && dbUrl.includes('@')) {
    maskedUrl = dbUrl.replace(/:[^@]*@/, ':****@');
  }
  
  return res.status(200).json({
    databaseUrl: maskedUrl,
    nodeEnv: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL
  });
}
