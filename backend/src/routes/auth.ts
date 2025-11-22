import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { errors } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { createSession, destroySession, setSessionCookies, verifySession } from '../services/session';
import { env } from '../config/env';

const sessionCookieName = env.sessionCookieName;

const credentialsSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(256),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(256),
  newPassword: z.string().min(8).max(256),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const parse = credentialsSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());

    const { username, password } = parse.data;

    const existing = await app.prisma.user.findUnique({ where: { username } });
    if (existing) return errors.conflict(reply, 'Username already taken');

    const passwordHash = await hashPassword(password);

    const user = await app.prisma.user.create({
      data: { username, passwordHash },
    });

    const { rawToken, rawCsrf, expiresAt } = await createSession(user.id);
    setSessionCookies(reply, rawToken, rawCsrf, expiresAt);

    return reply.send({ user: { id: user.id, username: user.username }, csrfToken: rawCsrf });
  });

  app.post('/auth/login', async (request, reply) => {
    const parse = credentialsSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());

    const { username, password } = parse.data;
    const user = await app.prisma.user.findUnique({ where: { username } });
    if (!user) return errors.unauthorized(reply, 'Invalid credentials');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return errors.unauthorized(reply, 'Invalid credentials');

    const { rawToken, rawCsrf, expiresAt } = await createSession(user.id);
    setSessionCookies(reply, rawToken, rawCsrf, expiresAt);

    return reply.send({ user: { id: user.id, username: user.username }, csrfToken: rawCsrf });
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies?.[sessionCookieName];
    if (token) {
      await destroySession(token);
    }
    reply.clearCookie(sessionCookieName, { path: '/' });
    reply.clearCookie('csrf_token', { path: '/' });
    return reply.send({ ok: true });
  });

  app.get('/auth/me', async (request, reply) => {
    const token = request.cookies?.[sessionCookieName];
    const csrfHeader = request.headers['x-csrf-token'] as string | undefined;
    const result = await verifySession(token, csrfHeader);
    if (!result.ok) return errors.unauthorized(reply, 'Invalid session');

    const user = await app.prisma.user.findUnique({ where: { id: result.userId } });
    if (!user) return errors.unauthorized(reply, 'Invalid session');

    return reply.send({ user: { id: user.id, username: user.username }, csrfToken: result.csrfToken });
  });

  app.post('/auth/password', async (request, reply) => {
    const token = request.cookies?.[sessionCookieName];
    const csrfHeader = request.headers['x-csrf-token'] as string | undefined;
    const sessionCheck = await verifySession(token, csrfHeader);
    if (!sessionCheck.ok) return errors.unauthorized(reply, 'Invalid session');

    const parse = changePasswordSchema.safeParse(request.body);
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());

    const { currentPassword, newPassword } = parse.data;
    const user = await app.prisma.user.findUnique({ where: { id: sessionCheck.userId } });
    if (!user) return errors.unauthorized(reply, 'Invalid session');

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return errors.unauthorized(reply, 'Invalid credentials');

    const newHash = await hashPassword(newPassword);
    await app.prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

    return reply.send({ ok: true });
  });
};
