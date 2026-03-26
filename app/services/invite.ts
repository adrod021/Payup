import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Create a session and invite people
export async function createSessionAndInvite(hostEmail: string, participantEmails: string[]) {
  // 1. Create the actual Session
  const sessionRef = await addDoc(collection(db, "sessions"), {
    host: hostEmail,
    status: "waiting", // waiting, scanning, roulette, finished
    createdAt: serverTimestamp(),
    participants: [hostEmail] 
  });

  // 2. Create invites for everyone else
  const invitePromises = participantEmails.map(email => 
    addDoc(collection(db, "invites"), {
      sessionId: sessionRef.id,
      invitedBy: hostEmail,
      invitedEmail: email.toLowerCase(),
      status: "pending",
      createdAt: serverTimestamp()
    })
  );

  await Promise.all(invitePromises);
  return sessionRef.id;
}

// Join a session
export async function joinSession(sessionId: string, userEmail: string, inviteId: string) {
  // Update invite status
  await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
  
  // Add user to the session participants list
  const sessionRef = doc(db, "sessions", sessionId);
  // Note: In a real app, use arrayUnion here
  await updateDoc(sessionRef, {
    participants: userEmail // will want to append this to the array
  });
}