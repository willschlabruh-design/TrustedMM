import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });

  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try{
    // ensure room exists
    const room = await prisma.room.findUnique({ where: { id } });
    if(!room) return res.status(404).json({ error: 'Room not found' });

    // create membership, ignore duplicates
    try{ await prisma.roomMember.create({ data: { roomId: room.id, userId: ctx.user.id } }); }catch(e:any){ /* ignore */ }

    return res.status(200).json({ ok: true, roomId: room.id });
  }catch(err:any){ console.error('join room error', err); return res.status(500).json({ error: 'Server error' }); }
}
