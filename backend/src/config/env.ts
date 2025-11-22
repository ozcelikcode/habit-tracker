import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const env = {
  nodeEnv: NODE_ENV,
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'session_token',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 30),
};

export const isProduction = env.nodeEnv === 'production';
