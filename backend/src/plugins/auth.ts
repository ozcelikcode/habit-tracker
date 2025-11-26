import fp from 'fastify-plugin';
import { errors } from '../lib/errors';
import { verifySession } from '../services/session';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyInstance {
    verifyAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

import type { FastifyReply, FastifyRequest } from 'fastify';

export const authPlugin = fp(async (app) => {
  app.decorate('verifyAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionCookie = request.cookies?.[env.sessionCookieName];
    const csrfHeader = request.headers['x-csrf-token'] as string | undefined;
    const result = await verifySession(sessionCookie, csrfHeader);
    if (!result.ok) {
      return errors.unauthorized(reply, 'Invalid session');
    }
    request.user = result.user;
    return;
  });
});
