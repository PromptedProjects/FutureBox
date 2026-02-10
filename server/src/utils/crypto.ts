import { randomBytes, createHash } from 'node:crypto';

/** 32-byte random token, URL-safe base64 (for pairing) */
export function generatePairingToken(): string {
  return randomBytes(32).toString('base64url');
}

/** 48-byte random token, URL-safe base64 (for sessions) */
export function generateSessionToken(): string {
  return randomBytes(48).toString('base64url');
}

/** SHA-256 hash of a token — stored in DB, never the raw token */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
