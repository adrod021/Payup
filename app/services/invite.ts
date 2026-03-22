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



// New invite service code 

import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { addMember } from "./groupService";
import { Invite } from "../models/Invite";

export async function createInvite(
  groupId: string,
  invitedBy: string,
  invitedUserId?: string,
  invitedEmail?: string
): Promise<string> {
  const invite: Omit<Invite, "id"> = {
    invitedBy,
    invitedUserId: invitedUserId || null,
    invitedEmail: invitedEmail || null,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const inviteRef = await addDoc(collection(db, "groups", groupId, "invites"), invite);
  return inviteRef.id;
}

export async function acceptInvite(groupId: string, inviteId: string): Promise<void> {
  const inviteRef = doc(db, "groups", groupId, "invites", inviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error("Invite not found");
  }

  const invite = inviteSnap.data() as Invite;

  if (invite.status !== "pending") {
    throw new Error("Invite already handled");
  }

  if (!invite.invitedUserId) {
    throw new Error("Invite missing invited user ID");
  }

  await addMember(groupId, invite.invitedUserId);

  await updateDoc(inviteRef, {
    status: "accepted",
    acceptedAt: new Date().toISOString()
  });
}

export async function declineInvite(groupId: string, inviteId: string): Promise<void> {
  const inviteRef = doc(db, "groups", groupId, "invites", inviteId);

  await updateDoc(inviteRef, {
    status: "declined",
    declinedAt: new Date().toISOString()
  });
}