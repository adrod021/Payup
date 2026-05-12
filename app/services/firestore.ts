import type { BillSession, Invite, User } from '@/app/types';
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * FIRESTORE SERVICE LAYER
 * This file contains the standard "one-time" database operations.
 * Unlike real-time listeners (onSnapshot), these functions are used for 
 * initial fetches, data creation, and final updates (For example: History or Summary).
 */

// Saves a new user profile using their unique Firebase UID
export async function createUser(user: User): Promise<void> {
  // Used during sign-up to store custom profile data (role, username, etc.)
  const userId = user.uid || (user as any).uid; 
  if (!userId) throw new Error("User ID is required to create a profile.")

  await setDoc(doc(db, "users", userId), user)
}

// Retrieves a specific user's data from the database based on their ID
export async function getUser(userId: string): Promise<User> {
  // Used for one-time profile lookups or verifying user roles
  const snap = await getDoc(doc(db, "users", userId))
  return snap.data() as User
}

// Creates a new bill splitting session and returns the auto-generated document ID
export async function createBillSession(session: BillSession): Promise<string> {
  // Triggered when a host clicks "Host a Session" to initialize the room in DB
  const docRef = await addDoc(collection(db, "sessions"), session)
  return docRef.id
}

// Fetches a single session by ID and returns the data or null if not found
export async function getBillSession(sessionId: string): Promise<BillSession | null> {
  // Used by hooks like useBillSession to load session details for summary/history pages
  const snap = await getDoc(doc(db, "sessions", sessionId))
  if (snap.exists()) {
    return snap.data() as BillSession
  }
  return null
}

// Applies partial updates to an existing session (ex: changing status or adding items)
export async function updateBillSession(sessionId: string, data: Partial<BillSession>): Promise<void> {
  // Essential for moving a session from 'pending' to 'itemized' or 'completed'
  const docRef = doc(db, "sessions", sessionId)
  await updateDoc(docRef, data)
}

// Records a new group invite in the "invites" collection for a specific session
export async function createInvite(invite: Invite): Promise<string> {
  // Handles the actual database entry when a host sends a request to a friend
  const docRef = await addDoc(collection(db, "invites"), invite)
  return docRef.id
}