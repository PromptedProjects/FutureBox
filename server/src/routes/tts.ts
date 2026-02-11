import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getConfig } from '../config.js';
import { textToSpeech } from '../services/tts.service.js';

const ttsBodySchema = z.object({
  text: z.string().min(1),
  voice: z.string().optional(),
});

export async function ttsRoutes(app: FastifyInstance): Promise<void> {
  /** Convert text to speech using OpenAI TTS */
  app.post('/tts', async (request, reply) => {
    const config = getConfig();
    if (!config.OPENAI_API_KEY) {
      reply.code(503).send({ ok: false, error: 'OpenAI API key not configured' });
      return;
    }

    const body = ttsBodySchema.safeParse(request.body);
    if (!body.success) {
      reply.code(400).send({ ok: false, error: 'Invalid request: text is required' });
      return;
    }

    try {
      const audioBuffer = await textToSpeech(
        body.data.text,
        config.OPENAI_API_KEY,
        body.data.voice,
      );
      const base64 = audioBuffer.toString('base64');
      return { ok: true, data: { audio: base64 } };
    } catch (err: any) {
      reply.code(502).send({ ok: false, error: err.message ?? 'TTS failed' });
    }
  });
}
