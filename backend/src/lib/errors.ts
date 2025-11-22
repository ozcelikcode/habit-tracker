import { FastifyReply } from 'fastify';

type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT' | 'NOT_FOUND' | 'SERVER_ERROR';

export function sendError(
  reply: FastifyReply,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown
) {
  return reply.status(status).send({
    error: { code, message, details },
  });
}

export const errors = {
  badRequest: (reply: FastifyReply, message: string, details?: unknown) =>
    sendError(reply, 400, 'BAD_REQUEST', message, details),
  unauthorized: (reply: FastifyReply, message = 'Unauthorized') =>
    sendError(reply, 401, 'UNAUTHORIZED', message),
  forbidden: (reply: FastifyReply, message = 'Forbidden') =>
    sendError(reply, 403, 'FORBIDDEN', message),
  conflict: (reply: FastifyReply, message: string, details?: unknown) =>
    sendError(reply, 409, 'CONFLICT', message, details),
  notFound: (reply: FastifyReply, message = 'Not found') =>
    sendError(reply, 404, 'NOT_FOUND', message),
  serverError: (reply: FastifyReply, message = 'Server error', details?: unknown) =>
    sendError(reply, 500, 'SERVER_ERROR', message, details),
};
