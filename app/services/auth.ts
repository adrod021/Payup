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


// Code with edits like credientials
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../firebase/config";

export async function signUp(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}