import {
  addDoc,
  arrayUnion,
  collection,
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

// 10 distinct, high-contrast colors for the wheel
const ROULETTE_COLORS = [
  '#E63946', '#457B9D', '#1D3557', '#F4A261', '#2A9D8F', 
  '#8338EC', '#3A86FF', '#0077B6', '#606C38', '#283618'
];

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
  if (userSnapshot.empty) throw new Error("User not found.");

  const targetDoc = userSnapshot.docs[0];
  const requestId = `${currentUser.uid}_${targetDoc.id}`;
  await setDoc(doc(db, "friendRequests", requestId), {
    fromUid: currentUser.uid,
    fromUsername: currentUser.username || "User",
    toUid: targetDoc.id,
    toUsername: targetDoc.data().username || "User",
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function createSessionAndInvite(hostUser: AppUser, participantIdentifiers: string[], existingSessionId?: string) {
  let sessionId = existingSessionId;
  if (!sessionId) {
    const sessionRef = await addDoc(collection(db, "sessions"), {
      hostId: hostUser.uid, 
      hostName: hostUser.username,
      status: "waiting", 
      stage: "setup", 
      createdAt: serverTimestamp(),
      participants: [hostUser.uid],
      participantUsernames: [hostUser.username || "Host"],
      participantColors: [ROULETTE_COLORS[0]] // Host gets color 1
    });
    sessionId = sessionRef.id;
  }

  const invitePromises = participantIdentifiers.map(async (identifier) => {
    const cleanId = identifier.toLowerCase().trim();
    return addDoc(collection(db, "invites"), {
      sessionId,
      invitedBy: hostUser.uid,
      invitedEmail: cleanId, 
      status: "pending",
      createdAt: serverTimestamp()
    });
  });
  await Promise.all(invitePromises);
  return sessionId;
}

export async function joinSession(sessionId: string, userId: string, inviteId: string) {
  if (inviteId) await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
  
  const userSnap = await getDoc(doc(db, "users", userId));
  const sessionRef = doc(db, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  const currentParticipants = sessionSnap.data()?.participants || [];
  const assignedColor = ROULETTE_COLORS[currentParticipants.length % ROULETTE_COLORS.length];

  await updateDoc(sessionRef, {
    participants: arrayUnion(userId),
    participantUsernames: arrayUnion(userSnap.data()?.username || "New Member"),
    participantColors: arrayUnion(assignedColor)
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