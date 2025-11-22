import type { PrismaClient, Session, User } from '../generated/prisma';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    user?: User | null;
    session?: Session | null;
  }
}
