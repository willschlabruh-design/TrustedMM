import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createVerificationToken } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method === 'POST') {
    // Send verification email for admin login
    const { userId } = req.body;
    console.log(`🔐 Admin login request for userId: ${userId}`);
    
    if(!userId) return res.status(400).json({ error: 'Missing userId' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`🔐 User found: ${user?.email}, Role: ${user?.role}`);
    
    if(!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

    try {
      console.log(`🔐 Creating verification token for admin...`);
      const token = await createVerificationToken(user.id, 'admin_login', 24);
      const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/admin-verify?token=${token}`;
      
      console.log(`🔐 Sending verification email to: ${user.email}`);
      console.log(`🔐 Verification link: ${verifyLink}`);
      
      await sendVerificationEmail(user.email, verifyLink);
      console.log(`🔐 Email sent successfully`);
      
      return res.status(200).json({ ok: true, message: 'Verification email sent' });
    } catch(e) {
      console.error('❌ Admin login error:', e);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }
  
  res.status(405).end();
}
