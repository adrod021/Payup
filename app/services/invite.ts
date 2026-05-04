import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { User as AppUser } from "../types";

/**
 * Friend system functions
 */
export async function sendFriendRequest(currentUser: AppUser, targetIdentifier: string) {
  const identifier = targetIdentifier.trim().toLowerCase();
  
  if (identifier === currentUser.email?.toLowerCase() || identifier === currentUser.phoneNumber) {
    throw new Error("You cannot add yourself.");
  }

  const usersRef = collection(db, "users");
  let qUser = query(usersRef, where("email", "==", identifier));
  let userSnapshot = await getDocs(qUser);

  if (userSnapshot.empty) {
    qUser = query(usersRef, where("phoneNumber", "==", identifier));
    userSnapshot = await getDocs(qUser);
  }

  if (userSnapshot.empty) {
    throw new Error("User not found. Ensure they have an account.");
  }

  const targetDoc = userSnapshot.docs[0];
  const targetData = targetDoc.data();
  const targetUid = targetDoc.id;
  const targetUsername = targetData.username || "User";

  const requestId = `${currentUser.uid}_${targetUid}`;
  const requestRef = doc(db, "friendRequests", requestId);

  await setDoc(requestRef, {
    fromUid: currentUser.uid,
    fromUsername: currentUser.username,
    fromIdentifier: currentUser.email || currentUser.phoneNumber,
    toUid: targetUid,
    toUsername: targetUsername,
    toIdentifier: identifier,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(requestId: string) {
  const requestRef = doc(db, "friendRequests", requestId);
  await updateDoc(requestRef, {
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });
}

/**
 * Session and billing functions
 */

export async function createSessionAndInvite(
  hostUser: AppUser, 
  participantIdentifiers: string[],
  existingSessionId?: string 
) {
  let sessionId = existingSessionId;

  if (!sessionId) {
    const sessionRef = await addDoc(collection(db, "sessions"), {
      hostId: hostUser.uid, 
      hostEmail: hostUser.email,
      hostName: hostUser.username,
      status: "waiting", 
      createdAt: serverTimestamp(),
      participants: [hostUser.email || hostUser.phoneNumber] 
    });
    sessionId = sessionRef.id;
  }

  const invitePromises = participantIdentifiers.map(async (identifier) => {
    return addDoc(collection(db, "invites"), {
      sessionId: sessionId,
      invitedBy: hostUser.uid,
      invitedByEmail: hostUser.email || hostUser.phoneNumber,
      hostName: hostUser.username,
      invitedEmail: identifier.toLowerCase().trim(), 
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
  
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    participants: arrayUnion(userId) 
  });
}

// FIX: Uses writeBatch and deleteDoc
export async function closeSession(sessionId: string) {
  const batch = writeBatch(db);
  
  // Delete session doc
  batch.delete(doc(db, "sessions", sessionId));
  
  // Find and delete all invites for this session
  const q = query(collection(db, "invites"), where("sessionId", "==", sessionId));
  const inviteSnaps = await getDocs(q);
  inviteSnaps.forEach((d) => batch.delete(d.ref));
  
  await batch.commit();
}

// FIX: Uses arrayRemove
export async function leaveSession(sessionId: string, userId: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    participants: arrayRemove(userId)
  });
}

// FIX: Uses deleteDoc individually if needed
export async function declineInvite(inviteId: string) {
  await deleteDoc(doc(db, "invites", inviteId));
}