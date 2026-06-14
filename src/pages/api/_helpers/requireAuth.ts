import { getUserFromRequest } from '../../../lib/session';

export async function requireAuth(req:any, res:any){
  const ctx = await getUserFromRequest(req);
  if(!ctx || !ctx.user) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return ctx;
}

export function requireRole(ctx:any, roles:string[]){
  if(!ctx || !ctx.user) return false;
  // Treat legacy MIDDLEMAN role as ADMIN (roles merged)
  const role = ctx.user.role === 'MIDDLEMAN' ? 'ADMIN' : ctx.user.role;
  return roles.includes(role);
}
