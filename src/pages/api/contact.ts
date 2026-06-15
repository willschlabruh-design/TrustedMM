import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { email, name, message } = req.body || {};
  if(!email || !message) return res.status(400).json({ error: 'Missing email or message' });

  // Find all admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  const payload = JSON.stringify({ email, name: name || null, message });

  const creates = admins.map((a: any) => prisma.notification.create({ data: { userId: a.id, type: 'contact_message', payload } }));
  await Promise.all(creates);

  // send email to admins for contact messages
  try{
    const site = process.env.SITE_URL || '';
    for(const admin of admins){
      try{
        const subject = `New contact message from ${email}`;
        const html = `<p>You received a new contact message:</p><p>From: ${name || email}</p><blockquote>${message}</blockquote><p><a href="${site}/admin">Open admin panel</a></p>`;
        const { sendEmail } = await import('../../lib/mailer');
        await sendEmail(admin.email, subject, html, `New contact message from ${name || email}: ${message}`);
      }catch(e){ console.error('failed sending admin contact email', e); }
    }
  }catch(e){ console.error('admin contact email loop failed', e); }

  return res.status(201).json({ ok: true });
}
