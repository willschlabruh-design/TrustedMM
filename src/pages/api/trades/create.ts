import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, description, buyerUsername, sellerUsername, value } = req.body;
  if (!title || !buyerUsername || !sellerUsername) return res.status(400).json({ error: 'Missing fields' });

  // Find accounts by `username` field
  const buyer = await prisma.user.findFirst({ where: { username: buyerUsername } });
  const seller = await prisma.user.findFirst({ where: { username: sellerUsername } });
  if (!buyer || !seller) return res.status(400).json({ error: 'Both buyer and seller must have accounts' });

  // Find any user with the ADMIN role to act as platform middleman (roles merged)
  const middleman = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!middleman) return res.status(500).json({ error: 'Platform middleman account not configured' });

  // Create trade
  const trade = await prisma.trade.create({
    data: {
      title,
      description,
      value: value ? Number(value) : 0,
      buyerId: buyer.id,
      sellerId: seller.id,
      middlemanId: middleman.id,
    }
  });

  // Create a message room and add members (middleman + buyer + seller)
  const room = await prisma.room.create({
    data: {
      tradeId: trade.id,
      members: {
        create: [
          { userId: middleman.id },
          { userId: buyer.id },
          { userId: seller.id }
        ]
      }
    },
    include: { members: true }
  });

  // Post an initial system message into the room
  await prisma.message.create({
    data: {
      roomId: room.id,
      senderId: middleman.id,
      body: `Room created for trade ${trade.title}. Participants: ${middleman.username || middleman.email}, ${buyer.username || buyer.email}, ${seller.username || seller.email}`
    }
  });

  // Notify buyer and seller
  await prisma.notification.createMany({
    data: [
      { userId: buyer.id, type: 'trade_created', payload: JSON.stringify({ tradeId: trade.id, roomId: room.id }) },
      { userId: seller.id, type: 'trade_created', payload: JSON.stringify({ tradeId: trade.id, roomId: room.id }) }
    ]
  });

  // Notify the platform middleman explicitly
  try{
    await prisma.notification.create({ data: { userId: middleman.id, type: 'trade_assigned', payload: JSON.stringify({ tradeId: trade.id, roomId: room.id }) } });
  }catch(e){ /* ignore */ }

  return res.status(201).json({ trade, roomId: room.id });
}
