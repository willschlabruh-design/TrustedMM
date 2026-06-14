import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../_helpers/requireAuth';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const ctx = await requireAuth(req, res as any);
    if(!ctx) return res.status(401).json({ error: 'Unauthorized' });
    if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });
    if(ctx.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });

    if(req.method !== 'POST') return res.status(405).end();
    const { id } = req.body || {};
    if(!id) return res.status(400).json({ error: 'Missing notification id' });

    const notif = await prisma.notification.findUnique({ where: { id } });
    if(!notif) return res.status(404).json({ error: 'Notification not found' });
    let payload: any = {};
    try{ payload = JSON.parse(notif.payload || '{}'); }catch(e){}

    const email = payload.email;
    const message = payload.message || '';
    if(!email) return res.status(400).json({ error: 'Notification payload missing sender email' });

    // find or create user for sender
    let user = await prisma.user.findUnique({ where: { email } });
    if(!user){
      // generate a username based on email
      const base = email.split('@')[0].replace(/[^a-z0-9_-]/gi,'').slice(0,12) || 'guest';
      let username = base;
      let suffix = 0;
      while(await prisma.user.findUnique({ where: { username } })){ suffix++; username = `${base}${suffix}`; }
      const pw = Math.random().toString(36).slice(2,12) || 'changeme';
      const hashed = await hashPassword(pw);
      user = await prisma.user.create({ data: { email, username, password: hashed } });
    }

    // create room and add members (admin and sender)
    const room = await prisma.room.create({ data: {} });
    // insert members one-by-one and ignore unique constraint errors
    try{ await prisma.roomMember.create({ data: { roomId: room.id, userId: ctx.user.id } }); }catch(e:any){ /* ignore */ }
    try{ await prisma.roomMember.create({ data: { roomId: room.id, userId: user.id } }); }catch(e:any){ /* ignore */ }

    // create initial message authored by sender
    await prisma.message.create({ data: { roomId: room.id, senderId: user.id, body: message } });

    // mark notification read
    await prisma.notification.update({ where: { id }, data: { read: true } });

    return res.status(201).json({ ok: true, roomId: room.id });
  }catch(err:any){
    console.error('create-chat error', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
