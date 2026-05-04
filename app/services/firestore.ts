import type { BillSession, Invite, User } from '@/app/types';
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Saves a new user profile using their unique Firebase UID
export async function createUser(user: User): Promise<void> {
  // Use .uid to ensure the document ID matches the Auth ID
  const userId = user.uid || (user as any).uid; 
  if (!userId) throw new Error("User ID is required to create a profile.");

  await setDoc(doc(db, "users", userId), user);
}
// Retrieves a specific user's data from the database based on their ID
export async function getUser(userId: string): Promise<User> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.data() as User;
}

// Creates a new bill splitting session and returns the auto-generated document ID
export async function createBillSession(session: BillSession): Promise<string> {
  const docRef = await addDoc(collection(db, "sessions"), session);
  return docRef.id;
}

// Fetches a single session by ID and returns the data or null if not found
export async function getBillSession(sessionId: string): Promise<BillSession | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (snap.exists()) {
    return snap.data() as BillSession;
  }
  return null;
}

// Applies partial updates to an existing session (ex: changing status or adding items)
export async function updateBillSession(sessionId: string, data: Partial<BillSession>): Promise<void> {
  const docRef = doc(db, "sessions", sessionId);
  await updateDoc(docRef, data);
}

// Records a new group invite in the "invites" collection for a specific session
export async function createInvite(invite: Invite): Promise<string> {
  const docRef = await addDoc(collection(db, "invites"), invite);
  return docRef.id;
}