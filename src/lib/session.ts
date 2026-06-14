import { verifyJwt } from './auth';
import { prisma } from './prisma';

export async function getUserFromRequest(req: any){
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/token=([^;]+)/);
  if(!match) return null;
  const token = match[1];
  const payload: any = verifyJwt(token) as any;
  if(!payload || !payload.sub) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  return { user, token };
}
