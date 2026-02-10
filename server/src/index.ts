import { loadConfig } from './config.js';
import { createLogger } from './utils/logger.js';
import { buildServer } from './server.js';
import { initDatabase, closeDatabase } from './storage/database.js';
import { runMigrations } from './storage/migrations.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { registry } from './providers/provider-registry.js';
import { Capability } from './providers/provider.interface.js';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.LOG_LEVEL);

  logger.info('FutureBox server starting...');

  // Initialize storage
  const db = initDatabase(config.DATA_DIR, logger);
  runMigrations(db, logger);

  // Initialize providers
  const ollama = new OllamaProvider(config.OLLAMA_HOST);
  registry.registerProvider(ollama);

  // Default capability assignments (Ollama local models)
  if (await ollama.isAvailable()) {
    const models = await ollama.listModels();
    if (models.length > 0) {
      const defaultModel = models[0].id;
      registry.assign(Capability.Language, 'ollama', defaultModel);
      logger.info(`Ollama available — default language model: ${defaultModel}`);
    }
  } else {
    logger.warn('Ollama not reachable — local models unavailable');
  }

  const app = await buildServer(config, logger);

  await app.listen({ host: config.HOST, port: config.PORT });
  logger.info(`FutureBox listening on ${config.HOST}:${config.PORT}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down`);
    await app.close();
    closeDatabase(logger);
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal error starting FutureBox:', err);
  process.exit(1);
});
