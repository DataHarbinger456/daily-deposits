import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getDb, usersTable } from './db';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';

export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // Find user by email
        const db = getDb();
        if (!db) return null;

        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (users.length === 0) return null;

        const user = users[0];

        // Verify password
        try {
          const passwordMatch = await verify(user.password, password);
          if (!passwordMatch) return null;
        } catch {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized: async ({ auth }: { auth: unknown }) => {
      return !!auth;
    },
  },
};

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
