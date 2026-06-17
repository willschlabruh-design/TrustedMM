import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error:
      'Trade browsing is no longer available. Submit a trade request and TrustedMM will assign platform oversight.',
    redirect: '/create-trade',
  });
}
