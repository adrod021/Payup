/**
 * Invite service placeholder.
 *
 * The backend team can implement invite flows with Firestore or another DB.
 */

export async function createInvite(groupId: string, invitedBy: string, invitedEmail: string | null) {
  throw new Error('createInvite not implemented');
}

export async function acceptInvite(groupId: string, inviteId: string) {
  throw new Error('acceptInvite not implemented');
}

export async function declineInvite(groupId: string, inviteId: string) {
  throw new Error('declineInvite not implemented');
}
