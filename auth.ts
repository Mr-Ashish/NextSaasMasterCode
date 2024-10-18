import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import authConfig from './auth.config';

const prisma = new PrismaClient();

const isVerificationEmailDisabled =
  process.env.DISABLE_EMAIL_VERIFICATION === 'true';

async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email, active: true },
    });

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    await prisma.$disconnect();
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'm@example.com' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'password',
        },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user || !user.password || !user.active) {
            return null;
          }
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }
          if (!user.isVerified && !isVerificationEmailDisabled) {
            throw new Error('EmailVerificationPending');
          }
          if (isValid)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
        }
        return null;
      },
    }),
  ],
});
