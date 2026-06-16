import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error:
      'Middleman browsing is no longer available. Submit a trade request and TrustedMM will assign a verified middleman.',
    redirect: '/create-trade',
  });
}
