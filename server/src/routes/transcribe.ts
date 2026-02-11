import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getConfig } from '../config.js';
import { transcribeAudio } from '../services/transcription.service.js';

const transcribeBodySchema = z.object({
  audio: z.string().min(1),
  language: z.string().optional(),
});

export async function transcribeRoutes(app: FastifyInstance): Promise<void> {
  /** Transcribe base64-encoded audio using OpenAI Whisper */
  app.post('/transcribe', async (request, reply) => {
    const config = getConfig();
    if (!config.OPENAI_API_KEY) {
      reply.code(503).send({ ok: false, error: 'OpenAI API key not configured' });
      return;
    }

    const body = transcribeBodySchema.safeParse(request.body);
    if (!body.success) {
      reply.code(400).send({ ok: false, error: 'Invalid request: audio (base64) is required' });
      return;
    }

    try {
      const text = await transcribeAudio(body.data.audio, config.OPENAI_API_KEY, body.data.language);
      return { ok: true, data: { text } };
    } catch (err: any) {
      reply.code(502).send({ ok: false, error: err.message ?? 'Transcription failed' });
    }
  });
}
