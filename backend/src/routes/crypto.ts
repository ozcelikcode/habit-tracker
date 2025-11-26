import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { errors } from '../lib/errors';

export const cryptoRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.verifyAuth);

  app.get('/crypto/key-info', async (request, reply) => {
    const userId = request.user!.id;
    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errors.unauthorized(reply, 'Invalid session');
    return reply.send({
      version: user.e2eKeyVersion,
      recoveryHint: user.e2eRecoveryHint ?? null,
    });
  });

  const rotateSchema = z.object({
    recoveryHint: z.string().max(255).optional(),
  });

  app.post('/crypto/rotate', async (request, reply) => {
    const userId = request.user!.id;
    const parse = rotateSchema.safeParse(request.body ?? {});
    if (!parse.success) return errors.badRequest(reply, 'Invalid input', parse.error.flatten());

    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errors.unauthorized(reply, 'Invalid session');

    const updated = await app.prisma.user.update({
      where: { id: userId },
      data: {
        e2eKeyVersion: user.e2eKeyVersion + 1,
        e2eRecoveryHint: parse.data.recoveryHint ?? user.e2eRecoveryHint,
      },
    });

    // Client must re-encrypt data with the new key version; server does not store keys.
    return reply.send({
      version: updated.e2eKeyVersion,
      recoveryHint: updated.e2eRecoveryHint ?? null,
    });
  });
};
