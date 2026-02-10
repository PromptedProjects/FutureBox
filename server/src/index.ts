import { loadConfig } from './config.js';
import { createLogger } from './utils/logger.js';
import { buildServer } from './server.js';
import { initDatabase, closeDatabase } from './storage/database.js';
import { runMigrations } from './storage/migrations.js';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.LOG_LEVEL);

  logger.info('FutureBox server starting...');

  // Initialize storage
  const db = initDatabase(config.DATA_DIR, logger);
  runMigrations(db, logger);

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
