import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { User as AppUser } from "../types";

export async function createSessionAndInvite(
  hostUser: AppUser, 
  participantIdentifiers: string[],
  existingSessionId?: string 
) {
  let sessionId = existingSessionId;

  // 1. Create session if it doesn't exist
  if (!sessionId) {
    const sessionRef = await addDoc(collection(db, "sessions"), {
      hostId: hostUser.uid, 
      hostEmail: hostUser.email || "",
      hostName: hostUser.username,
      status: "waiting", 
      stage: "setup", 
      createdAt: serverTimestamp(),
      participants: [hostUser.uid],
      participantUsernames: [hostUser.username || "Host"],
      participantEmails: [hostUser.email || ""],
      participantPhones: [hostUser.phoneNumber || ""]
    });
    sessionId = sessionRef.id;
  }

  // 2. Handle Invites with Duplicate Prevention
  const invitePromises = participantIdentifiers.map(async (identifier) => {
    const cleanIdentifier = identifier.toLowerCase().trim();

    // Check for existing pending invites for this person in this session
    const q = query(
      collection(db, "invites"),
      where("sessionId", "==", sessionId),
      where("invitedEmail", "==", cleanIdentifier),
      where("status", "==", "pending")
    );
    
    const existingInvites = await getDocs(q);
    
    // Delete previous invites to avoid duplicates
    const batch = writeBatch(db);
    existingInvites.forEach((oldDoc) => {
      batch.delete(oldDoc.ref);
    });
    await batch.commit();

    // Send the new invite
    return addDoc(collection(db, "invites"), {
      sessionId: sessionId,
      invitedBy: hostUser.uid,
      invitedByEmail: hostUser.email || hostUser.phoneNumber,
      hostName: hostUser.username,
      invitedEmail: cleanIdentifier, 
      status: "pending",
      createdAt: serverTimestamp()
    });
  });

  await Promise.all(invitePromises);
  return sessionId;
}

export async function joinSession(sessionId: string, userId: string, inviteId: string) {
  if (inviteId) {
    await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
  }
  
  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.data();
  
  const userName = userData?.username || "New Member";
  const userEmail = userData?.email || "";
  const userPhone = userData?.phoneNumber || "";

  const sessionRef = doc(db, "sessions", sessionId);
  
  await updateDoc(sessionRef, {
    participants: arrayUnion(userId),
    participantUsernames: arrayUnion(userName),
    participantEmails: arrayUnion(userEmail),
    participantPhones: arrayUnion(userPhone)
  });
}

/**
 * Force closes the session and deletes all associated invites
 */
export async function closeSession(sessionId: string) {
  // Find all invites linked to this session
  const q = query(collection(db, "invites"), where("sessionId", "==", sessionId));
  const inviteSnaps = await getDocs(q);
  
  // Use a batch to delete all invites at once
  const batch = writeBatch(db);
  inviteSnaps.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // Finally delete the session itself
  await deleteDoc(doc(db, "sessions", sessionId));
}