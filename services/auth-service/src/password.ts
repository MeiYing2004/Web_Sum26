import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

/** Legacy secrets — users may have been hashed before JWT_SECRET was unified. */
const LEGACY_JWT_SECRETS = [
  process.env.JWT_SECRET || 'bus-booking-jwt-secret',
  'bus-booking-jwt-secret',
  'bus-booking-jwt-secret-change-in-prod',
];

function uniqueSecrets(): string[] {
  return [...new Set(LEGACY_JWT_SECRETS.filter(Boolean))];
}

function legacySha256Hash(password: string, secret: string): string {
  return crypto.createHash('sha256').update(password + secret).digest('hex');
}

export function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  for (const secret of uniqueSecrets()) {
    if (storedHash === legacySha256Hash(password, secret)) return true;
  }
  return false;
}

export function isPlaintextPassword(stored: string): boolean {
  return !!stored && !isBcryptHash(stored) && stored.length < 32;
}
