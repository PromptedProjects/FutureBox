import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listDirectory, readTextFile, getDefaultRoot } from '../services/files.service.js';

const pathQuery = z.object({
  path: z.string().min(1).optional(),
});

export async function filesRoutes(app: FastifyInstance): Promise<void> {
  /** List directory contents */
  app.get('/files/list', async (request, reply) => {
    const query = pathQuery.safeParse(request.query);
    const dirPath = query.success && query.data.path ? query.data.path : getDefaultRoot();

    try {
      const entries = listDirectory(dirPath);
      return { ok: true, data: { path: dirPath, entries } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list directory';
      const code = message.includes('not found') ? 404
        : message.includes('Access denied') ? 403
        : 400;
      reply.code(code).send({ ok: false, error: message });
    }
  });

  /** Read text file content (preview) */
  app.get('/files/read', async (request, reply) => {
    const query = pathQuery.safeParse(request.query);
    if (!query.success || !query.data.path) {
      reply.code(400).send({ ok: false, error: 'path query parameter is required' });
      return;
    }

    try {
      const content = readTextFile(query.data.path);
      return { ok: true, data: { path: query.data.path, content } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read file';
      const code = message.includes('not found') ? 404
        : message.includes('Access denied') ? 403
        : 400;
      reply.code(code).send({ ok: false, error: message });
    }
  });
}
