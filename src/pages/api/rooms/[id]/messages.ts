import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';
import { sendEmail } from '../../../../lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });
  const userId = ctx.user.id;

  if(req.method === 'POST'){
    const { body, attachments } = req.body || {};
    if(!body && !(attachments && attachments.length)) return res.status(400).json({ error: 'Missing body or attachments' });
    // ensure user is member of room
    const member = await prisma.roomMember.findFirst({ where: { roomId: id, userId: userId } });
    if(!member) return res.status(403).json({ error: 'Forbidden' });

    const msg = await prisma.message.create({ data: { roomId: id, senderId: userId, body: body || '' } });
    // handle attachments (expected: [{ filename, data, mime }])
    if(Array.isArray(attachments) && attachments.length){
      try{
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        for(const a of attachments){
          try{
            const fname = `${Date.now()}-${(a.filename||'file').replace(/[^a-zA-Z0-9_.-]/g,'')}`;
            const dest = path.join(uploadsDir, fname);
            const buffer = Buffer.from(a.data, 'base64');
            fs.writeFileSync(dest, buffer);
            const url = `/uploads/${fname}`;
            await prisma.file.create({ data: { url, filename: a.filename || fname, size: buffer.length, mime: a.mime || 'application/octet-stream', uploadedById: userId, messageId: msg.id } });
          }catch(e:any){ console.error('attachment save failed', e); }
        }
      }catch(e:any){ console.error('attachments handling failed', e); }
    }
    // create notifications for other room members
    const members = await prisma.roomMember.findMany({ where: { roomId: id } });
    const notifs = members.filter(m => m.userId !== userId).map(m => ({ userId: m.userId, type: 'message', payload: JSON.stringify({ roomId: id, messageId: msg.id, senderId: userId }) }));
    if(notifs.length) await prisma.notification.createMany({ data: notifs });

    // Send email to admin members only
    try{
      const recipientIds = members.filter(m => m.userId !== userId).map(m => m.userId);
      const adminUsers = await prisma.user.findMany({ where: { id: { in: recipientIds }, role: 'ADMIN' } });
      const site = process.env.SITE_URL || '';
      for(const admin of adminUsers){
        try{
          const subject = `New message in room ${id}`;
          const link = `${site}/rooms/${id}`;
          const html = `<p>You have a new message in <a href="${link}">room ${id}</a>.</p><p>Message preview:</p><blockquote>${msg.body}</blockquote><p><a href="${link}">Open room</a></p>`;
          await sendEmail(admin.email, subject, html, `New message in room ${id}: ${msg.body}\nOpen: ${link}`);
        }catch(e){ console.error('admin email send failed', e); }
      }
    }catch(e){ console.error('failed sending admin emails for room message', e); }

    return res.status(201).json({ ok: true, message: msg });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
