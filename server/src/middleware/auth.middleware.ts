import type { FastifyRequest, FastifyReply } from 'fastify';
import { validateSession } from '../services/auth.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    sessionId?: string;
  }
}

/** Fastify preHandler — rejects with 401 if no valid Bearer token */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    reply.code(401).send({ ok: false, error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  const result = validateSession(token);

  if (!result) {
    reply.code(401).send({ ok: false, error: 'Invalid or revoked session token' });
    return;
  }

  request.sessionId = result.sessionId;
}
