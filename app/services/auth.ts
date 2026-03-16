/**
 * Authentication service placeholder.
 *
 * The backend team should implement actual auth operations and return the expected shape.
 */

import type { User } from '@/app/types';

export async function signIn(email: string, password: string): Promise<User> {
  throw new Error('signIn not implemented');
}

export async function signOut(): Promise<void> {
  throw new Error('signOut not implemented');
}

export async function getCurrentUser(): Promise<User | null> {
  throw new Error('getCurrentUser not implemented');
}
