import { FastifyReply } from 'fastify';
import { addDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import { hashToken, randomToken } from '../lib/crypto';
import { env, isProduction } from '../config/env';

const COOKIE_NAME = env.sessionCookieName;

export type SessionResult =
  | { ok: true; userId: string; csrfToken: string }
  | { ok: false; reason: 'NO_SESSION' | 'EXPIRED' };

export async function createSession(userId: string) {
  const rawToken = randomToken(32);
  const rawCsrf = randomToken(16);
  const expiresAt = addDays(new Date(), env.sessionTtlDays);

  await prisma.session.create({
    data: {
      userId,
      sessionToken: hashToken(rawToken),
      csrfToken: rawCsrf,
      expiresAt,
    },
  });

  return { rawToken, rawCsrf, expiresAt };
}

export async function destroySession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({
    where: { sessionToken: tokenHash },
  });
}

export async function verifySession(token?: string, csrfHeader?: string): Promise<SessionResult> {
  if (!token) return { ok: false, reason: 'NO_SESSION' };
  const tokenHash = hashToken(token);

  const session = await prisma.session.findFirst({
    where: { sessionToken: tokenHash },
    include: { user: true },
  });
  if (!session) return { ok: false, reason: 'NO_SESSION' };
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return { ok: false, reason: 'EXPIRED' };
  }
  if (csrfHeader && session.csrfToken !== csrfHeader) {
    return { ok: false, reason: 'NO_SESSION' };
  }
  return { ok: true, userId: session.userId, csrfToken: session.csrfToken };
}

export function setSessionCookies(reply: FastifyReply, rawToken: string, csrfToken: string, expires: Date) {
  reply.setCookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    expires,
  });
  reply.setCookie('csrf_token', csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    expires,
  });
}

export function clearSessionCookies(reply: FastifyReply) {
  reply.clearCookie(COOKIE_NAME, { path: '/' });
  reply.clearCookie('csrf_token', { path: '/' });
}
