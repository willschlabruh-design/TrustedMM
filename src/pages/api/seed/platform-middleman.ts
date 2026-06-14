import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Dev-only safety
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Forbidden in production' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email : 'william.schlanbusch@gmail.com';
  let username = typeof body.username === 'string' ? body.username : 'platform_middleman';

  // Generate a random password for convenience
  const passwordPlain = Math.random().toString(36).slice(2, 10) + 'A1!';
  const passwordHash = await hashPassword(passwordPlain);

  // Ensure username uniqueness: if taken by a different user, append suffix
  let uniqueUsername = username;
  let counter = 1;
  while (true) {
    const other = await prisma.user.findUnique({ where: { username: uniqueUsername } });
    if (!other) break;
    if (other.email === email) break; // same user, allow
    uniqueUsername = `${username}${counter}`;
    counter++;
  }

  // Upsert by email
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username: uniqueUsername,
      role: 'ADMIN',
      password: passwordHash
    },
    create: {
      email,
      username: uniqueUsername,
      password: passwordHash,
      role: 'ADMIN',
      verified: true
    }
  });

  return res.status(200).json({ ok: true, email: user.email, username: user.username, password: passwordPlain });
}
