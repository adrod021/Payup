import { addDoc, arrayUnion, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Create a session and invite people
export async function createSessionAndInvite(hostEmail: string, participantEmails: string[]) {
  // 1. Create the actual Session
  const sessionRef = await addDoc(collection(db, "sessions"), {
    host: hostEmail,
    status: "waiting", // waiting, scanning, roulette, finished
    createdAt: serverTimestamp(),
    participants: [hostEmail] // Host is the first participant
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
  // 1. Update invite status to accepted (ONLY if inviteId exists)
  if (inviteId && inviteId.trim() !== "") {
    await updateDoc(doc(db, "invites", inviteId), { status: "accepted" });
  }
  
  // 2. Add user to the session participants list without overwriting others
  const sessionRef = doc(db, "sessions", sessionId);
  
  await updateDoc(sessionRef, {
    // arrayUnion ensures the email is only added if it's not already there
    participants: arrayUnion(userEmail) 
  });
}