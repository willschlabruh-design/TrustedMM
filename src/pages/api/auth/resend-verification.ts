import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createVerificationToken } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { userId, email } = req.body;

  if(!userId && !email) return res.status(400).json({ error: 'Missing userId or email' });

  let user;
  if(userId){
    user = await prisma.user.findUnique({ where: { id: userId } });
  } else {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if(!user) return res.status(404).json({ error: 'User not found' });

  // Generate new token
  const token = await createVerificationToken(user.id, 'email_verification', 48);
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

  // Send email
  try{
    await sendVerificationEmail(user.email, verifyLink);
  } catch(e){
    console.error('Failed to send verification email:', e);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.status(200).json({ ok: true, message: 'Verification email sent' });
}
