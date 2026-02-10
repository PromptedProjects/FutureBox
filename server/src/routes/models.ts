import type { FastifyInstance } from 'fastify';
import { registry } from '../providers/provider-registry.js';
import { Capability } from '../providers/provider.interface.js';
import type { LLMProvider } from '../providers/provider.interface.js';

export async function modelRoutes(app: FastifyInstance): Promise<void> {
  /** List all available models across all providers */
  app.get('/models', async () => {
    const allModels = [];

    for (const [, provider] of registry.getAllProviders()) {
      try {
        if (await (provider as LLMProvider).isAvailable()) {
          const models = await (provider as LLMProvider).listModels();
          allModels.push(...models);
        }
      } catch {
        // Provider unavailable, skip
      }
    }

    return { ok: true, data: { models: allModels } };
  });

  /** Get current capability → provider+model assignments */
  app.get('/models/slots', async () => {
    const slots: Record<string, { provider: string; model: string } | null> = {};

    for (const cap of Object.values(Capability)) {
      const slot = registry.resolve(cap);
      slots[cap] = slot ? { provider: (slot.provider as LLMProvider).name, model: slot.model } : null;
    }

    return { ok: true, data: { slots } };
  });
}
