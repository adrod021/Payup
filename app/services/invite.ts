import { addDoc, arrayUnion, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Friend system functions
 */

// Validates and saves a new pending friend request if no duplicate exists
export async function sendFriendRequest(senderEmail: string, receiverEmail: string) {
  const cleanEmail = receiverEmail.toLowerCase().trim();
  
  // Prevent sending to self
  if (senderEmail === cleanEmail) throw new Error("You cannot add yourself.");

  // Check for existing pending requests to prevent duplicate spam
  const q = query(
    collection(db, "friendRequests"),
    where("from", "==", senderEmail),
    where("to", "==", cleanEmail),
    where("status", "==", "pending")
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) throw new Error("Request already pending.");

  return await addDoc(collection(db, "friendRequests"), {
    from: senderEmail,
    to: cleanEmail,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// Marks a specific friend request as accepted
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

// Initializes a new bill split session and creates pending invites for all selected friends
// Note: We are not using a code for invites for Prototype 2
export async function createSessionAndInvite(
  hostEmail: string, 
  participantEmails: string[], 
  hostName: string 
) {
  // 1. Create the master session document
  const sessionRef = await addDoc(collection(db, "sessions"), {
    host: hostEmail,
    hostName: hostName,
    status: "waiting", // Initial state for the loading screen
    createdAt: serverTimestamp(),
    participants: [hostEmail.toLowerCase().trim()] // Host is the first member
  });

  // 2. Map emails to individual invite documents for the "Join Group" query
  const invitePromises = participantEmails.map(email => 
    addDoc(collection(db, "invites"), {
      sessionId: sessionRef.id,
      invitedBy: hostEmail,
      hostName: hostName,
      invitedEmail: email.toLowerCase().trim(),
      status: "pending",
      createdAt: serverTimestamp()
    })
  );

  await Promise.all(invitePromises);
  return sessionRef.id;
}

// Moves a user from the invite list into the active session participants array
export async function joinSession(sessionId: string, userEmail: string, inviteId: string) {
  // Update the invite status so it disappears from the user's "Found Invites" list
  if (inviteId && inviteId.trim() !== "") {
    await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
  }
  
  // Add the user to the actual session so the host sees the joinedCount increase
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    participants: arrayUnion(userEmail.toLowerCase().trim()) 
  });
}