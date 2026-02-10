import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { Logger } from '../utils/logger.js';

let db: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}

export function initDatabase(dataDir: string, logger: Logger): DatabaseSync {
  if (db) return db;

  // Ensure data directory exists
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    logger.info(`Created data directory: ${dataDir}`);
  }

  const dbPath = join(dataDir, 'futurebox.db');
  db = new DatabaseSync(dbPath);

  // Performance pragmas for local-only SQLite
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('PRAGMA foreign_keys = ON');

  logger.info(`Database opened: ${dbPath}`);
  return db;
}

export function closeDatabase(logger: Logger): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database closed');
  }
}
