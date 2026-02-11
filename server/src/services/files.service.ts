import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

const HOME_DIR = os.homedir();
const MAX_READ_BYTES = 500 * 1024; // 500KB

/** Resolve and validate that a path is within allowed roots (home dir or drive roots) */
function validatePath(input: string): string {
  const resolved = path.resolve(input);
  // Allow home dir and any drive root (e.g. C:\, D:\)
  const isDriveRoot = /^[A-Z]:\\$/i.test(resolved);
  const isUnderHome = resolved.toLowerCase().startsWith(HOME_DIR.toLowerCase());
  const isUnderDrive = /^[A-Z]:\\/i.test(resolved);
  if (!isUnderHome && !isUnderDrive && !isDriveRoot) {
    throw new Error('Access denied: path outside allowed roots');
  }
  return resolved;
}

export function getDefaultRoot(): string {
  return HOME_DIR;
}

export function listDirectory(dirPath: string): FileEntry[] {
  const resolved = validatePath(dirPath);

  if (!fs.existsSync(resolved)) {
    throw new Error('Directory not found');
  }

  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    throw new Error('Path is not a directory');
  }

  const entries: FileEntry[] = [];

  for (const name of fs.readdirSync(resolved)) {
    try {
      const fullPath = path.join(resolved, name);
      const s = fs.statSync(fullPath);
      entries.push({
        name,
        path: fullPath,
        type: s.isDirectory() ? 'directory' : 'file',
        size: s.isDirectory() ? 0 : s.size,
        modified: s.mtime.toISOString(),
      });
    } catch {
      // Skip entries we can't stat (permission errors, etc.)
    }
  }

  // Sort: directories first, then alphabetical
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  return entries;
}

export function readTextFile(filePath: string, maxBytes?: number): string {
  const resolved = validatePath(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error('File not found');
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error('Path is not a file');
  }

  const limit = Math.min(maxBytes ?? MAX_READ_BYTES, MAX_READ_BYTES);

  if (stat.size > limit) {
    // Read only first `limit` bytes
    const buf = Buffer.alloc(limit);
    const fd = fs.openSync(resolved, 'r');
    fs.readSync(fd, buf, 0, limit, 0);
    fs.closeSync(fd);
    return buf.toString('utf-8');
  }

  return fs.readFileSync(resolved, 'utf-8');
}
