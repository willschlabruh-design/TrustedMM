import type { NextApiRequest, NextApiResponse } from 'next';
import { applyAdminGrantByIdentity } from '../../../lib/profile-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_ADMIN_BOOTSTRAP) {
    return res.status(403).json({ error: 'Forbidden in production' });
  }

  try {
    const users = await applyAdminGrantByIdentity();
    return res.status(200).json({
      ok: true,
      updated: users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      })),
    });
  } catch (error: any) {
    console.error('[admin-grant] bootstrap failed', error);
    return res.status(500).json({ error: error?.message || 'Failed to grant admin' });
  }
}
