import { getDatabase } from '../database.js';

export interface ConfigRow {
  key: string;
  value: string;
  updated_at: string;
}

export function getConfigValue(key: string): string | undefined {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT value FROM config WHERE key = ?'
  ).get(key) as { value: string } | undefined;
  return row?.value;
}

export function setConfigValue(key: string, value: string): void {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO config (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value);
}

export function getAllConfig(): ConfigRow[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM config ORDER BY key').all() as unknown as ConfigRow[];
}

export function deleteConfigValue(key: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM config WHERE key = ?').run(key);
  return result.changes > 0;
}
