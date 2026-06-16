import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendEmail } from '../../../lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, description, buyerUsername, sellerUsername, value } = req.body;
  if (!title || !buyerUsername || !sellerUsername) return res.status(400).json({ error: 'Missing fields' });

  // Find accounts by `username` field
  const buyer = await prisma.user.findFirst({ where: { username: buyerUsername } });
  const seller = await prisma.user.findFirst({ where: { username: sellerUsername } });
  if (!buyer || !seller) return res.status(400).json({ error: 'Both buyer and seller must have accounts' });

  // Create trade WITHOUT assigning a middleman yet
  const trade = await prisma.trade.create({
    data: {
      title,
      description,
      value: value ? Number(value) : 0,
      buyerId: buyer.id,
      sellerId: seller.id,
      status: 'WAITING_FOR_MIDDLEMEN'
    }
  });

  // Create a message room with buyer + seller (no middleman yet)
  const room = await prisma.room.create({
    data: {
      tradeId: trade.id,
      members: {
        create: [
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
      senderId: buyer.id,
      body: `Trade request submitted for "${trade.title}". TrustedMM is reviewing and will assign a verified middleman shortly.`
    }
  });

  // Notify buyer and seller
  await prisma.notification.createMany({
    data: [
      { userId: buyer.id, type: 'trade_created', payload: JSON.stringify({ tradeId: trade.id, roomId: room.id }) },
      { userId: seller.id, type: 'trade_created', payload: JSON.stringify({ tradeId: trade.id, roomId: room.id }) }
    ]
  });

  // Notify ALL admins that a middleman is needed
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin: any) => ({
        userId: admin.id,
        type: 'middleman_needed',
        payload: JSON.stringify({ tradeId: trade.id, roomId: room.id, buyerName: buyer.username || buyer.email, sellerName: seller.username || seller.email })
      }))
    });
    // send email alerts to admins
    try{
      const site = process.env.SITE_URL || '';
      for(const admin of admins){
        try{
          const link = `${site}/trades/${trade.id}`;
          const subject = `Middleman needed for trade #${trade.id}`;
          const html = `<p>A new trade requires a middleman.</p><p>Trade: <a href="${link}">#${trade.id}</a></p><p>Buyer: ${buyer.username || buyer.email}<br/>Seller: ${seller.username || seller.email}</p><p><a href="${link}">View trade</a></p>`;
          await sendEmail(admin.email, subject, html, `Middleman needed for trade #${trade.id}`);
        }catch(e){ console.error('failed to send admin email for middleman_needed', e); }
      }
    }catch(e){ console.error('failed sending admin emails for middleman notifications', e); }
  }

  return res.status(201).json({ trade, roomId: room.id });
}
