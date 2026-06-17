import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CANDIDATE_PATHS = [
  path.join(process.cwd(), 'public', 'images', 'logo.png'),
  path.join(process.cwd(), 'images', 'logo.png'),
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const logoPath = CANDIDATE_PATHS.find((p) => fs.existsSync(p));
    if (!logoPath) return res.status(404).end('Not found');

    const stat = fs.statSync(logoPath);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    fs.createReadStream(logoPath).pipe(res);
  } catch {
    res.status(500).end('Server error');
  }
}
