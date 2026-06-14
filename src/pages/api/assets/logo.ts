import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const p = path.join(process.cwd(), 'images', 'logo.png');
    if(!fs.existsSync(p)) return res.status(404).end('Not found');
    const stat = fs.statSync(p);
    res.setHeader('Content-Type','image/png');
    res.setHeader('Content-Length', String(stat.size));
    const stream = fs.createReadStream(p);
    stream.pipe(res);
  }catch(err:any){
    res.status(500).end('Server error');
  }
}
