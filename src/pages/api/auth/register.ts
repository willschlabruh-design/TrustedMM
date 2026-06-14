import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword, createVerificationToken } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { email, password, username } = req.body;
  if(!email || !password || !username) return res.status(400).json({ error: 'Missing email, password or username' });

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if(existingEmail) return res.status(409).json({ error: 'Email already registered' });

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if(existingUser) return res.status(409).json({ error: 'Username already taken' });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, username } });

  // create verification token
  const token = await createVerificationToken(user.id, 'email_verification', 48);
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
  // try sending email (falls back to logging the link when SMTP not configured)
  try{ await sendVerificationEmail(user.email, verifyLink); }catch(e){ console.error('sendVerificationEmail failed', e); }

  return res.status(201).json({ id: user.id, email: user.email, username: user.username, verifyLink });
}
