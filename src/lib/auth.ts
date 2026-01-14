import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Generate a new user ID
 */
export function generateUserId(): string {
  return generateIdFromEntropySize(16);
}
