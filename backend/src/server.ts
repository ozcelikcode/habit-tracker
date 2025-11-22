import fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import formBody from '@fastify/formbody';
import { env } from './config/env';
import { prismaPlugin } from './plugins/prisma';
import { authRoutes } from './routes/auth';

const app = fastify({
  logger: true,
});

async function buildServer() {
  await app.register(helmet);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(formBody);
  await app.register(prismaPlugin);

  // Healthcheck / status
  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes);

  return app;
}

async function start() {
  await buildServer();
  try {
    await app.listen({ port: env.port, host: env.host });
    app.log.info(`Server listening on http://${env.host}:${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
