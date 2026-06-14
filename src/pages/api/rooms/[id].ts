import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      trade: true,
      members: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } }
    }
  });

  if(!room) return res.status(404).json({ error: 'Room not found' });
  return res.status(200).json({ room });
}
