import { prisma } from './prisma';

function baseUsernameFromEmail(email: string) {
  const base = email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').slice(0, 12);
  return base || 'guest';
}

async function uniqueUsername(email: string, preferred?: string) {
  const base = (preferred || baseUsernameFromEmail(email)).slice(0, 20) || 'guest';
  let username = base;
  let suffix = 0;

  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${base}${suffix}`;
  }

  return username;
}

export async function createGuestPrismaUser(email: string) {
  const username = await uniqueUsername(email);
  return prisma.user.create({
    data: {
      email,
      username,
      password: '',
    },
  });
}
