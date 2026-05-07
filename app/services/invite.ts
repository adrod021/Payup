import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
 * FRIEND SYSTEM FUNCTIONS
 */

export async function sendFriendRequest(currentUser: AppUser, targetIdentifier: string) {
  const identifier = targetIdentifier.trim().toLowerCase();
  
  if (identifier === currentUser.email?.toLowerCase() || identifier === currentUser.phoneNumber) {
    throw new Error("You cannot add yourself.");
  }

  const usersRef = collection(db, "users");
  
  // Try searching by email
  let qUser = query(usersRef, where("email", "==", identifier));
  let userSnapshot = await getDocs(qUser);

  // If not found, try searching by phone
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

  // Unique ID for the request to prevent duplicates
  const requestId = `${currentUser.uid}_${targetUid}`;
  const requestRef = doc(db, "friendRequests", requestId);

  await setDoc(requestRef, {
    fromUid: currentUser.uid,
    fromUsername: currentUser.username || "User",
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

export async function declineInvite(inviteId: string) {
  await deleteDoc(doc(db, "invites", inviteId));
}

/**
 * SESSION & BILLING FUNCTIONS
 */

export async function createSessionAndInvite(
  hostUser: AppUser, 
  participantIdentifiers: string[],
  existingSessionId?: string 
) {
  let sessionId = existingSessionId;

  // 1. Create session if it doesn't exist (keeping your metadata updates)
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

    const q = query(
      collection(db, "invites"),
      where("sessionId", "==", sessionId),
      where("invitedEmail", "==", cleanIdentifier),
      where("status", "==", "pending")
    );
    
    const existingInvites = await getDocs(q);
    
    const batch = writeBatch(db);
    existingInvites.forEach((oldDoc) => {
      batch.delete(oldDoc.ref);
    });
    await batch.commit();

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

export async function leaveSession(sessionId: string, userId: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    participants: arrayRemove(userId)
  });
}

export async function closeSession(sessionId: string) {
  const q = query(collection(db, "invites"), where("sessionId", "==", sessionId));
  const inviteSnaps = await getDocs(q);
  
  const batch = writeBatch(db);
  inviteSnaps.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "sessions", sessionId));
  
  await batch.commit();
}