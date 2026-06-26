import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

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

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  return storedHash === legacySha256Hash(password, secret);
}
