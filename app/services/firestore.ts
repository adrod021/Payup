/**
 * Firestore service placeholder.
 *
 * The backend team can implement these functions using Firestore or another database provider.
 */

import type { BillSession, Invite, User } from '@/app/types';

export async function createUser(user: User): Promise<void> {
  throw new Error('createUser not implemented');
}

export async function getUser(userId: string): Promise<User> {
  throw new Error('getUser not implemented');
}

export async function createBillSession(session: BillSession): Promise<string> {
  throw new Error('createBillSession not implemented');
}

export async function getBillSession(sessionId: string): Promise<BillSession> {
  throw new Error('getBillSession not implemented');
}

export async function updateBillSession(session: BillSession): Promise<void> {
  throw new Error('updateBillSession not implemented');
}

export async function createInvite(invite: Invite): Promise<string> {
  throw new Error('createInvite not implemented');
}

export async function acceptInvite(groupId: string, inviteId: string): Promise<void> {
  throw new Error('acceptInvite not implemented');
}
