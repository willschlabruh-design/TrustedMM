import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES = '7d';

export function signJwt(payload: object){
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyJwt(token: string){
  try{ return jwt.verify(token, JWT_SECRET); }catch(e){ return null; }
}

export async function hashPassword(password: string){
  return bcrypt.hash(password, 12);
}
export async function comparePassword(password: string, hash: string){
  return bcrypt.compare(password, hash);
}

export function generateToken(){
  return crypto.randomBytes(32).toString('hex');
}

export async function createVerificationToken(userId: string, type: string, ttlHours = 24){
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await prisma.verificationToken.create({ data: { token, type, userId, expiresAt } });
  return token;
}

export function setAuthCookie(res: any, token: string){
  const secure = process.env.NODE_ENV === 'production';
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; ${secure? 'Secure; SameSite=None;' : ''}`;
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res: any){
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
}
