import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Fixed path

export async function createInvite(groupId: string, invitedBy: string, invitedUserId?: string, invitedEmail?: string): Promise<string> {
  const invite = {
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
  if (!inviteSnap.exists()) throw new Error("Invite not found");
  
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