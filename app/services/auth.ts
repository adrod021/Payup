import { createUserWithEmailAndPassword, signOut as firebaseSignOut, signInWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Create user and a profile doc in firestore
export async function signUp(email: string, password: string, username: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update firebase auth profile name
  await updateProfile(credential.user, {
    displayName: username,
  });

  // Save user info to firestore
  // Manually change role to 'admin' in console if needed
  await setDoc(doc(db, "users", credential.user.uid), {
    email: email.toLowerCase().trim(),
    username: username, 
    role: "user", 
    createdAt: new Date().toISOString()
  });

  // Refresh to make sure UI sees the new name
  await credential.user.reload();

  return auth.currentUser!; 
}

// Basic login
export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user; 
}

// Sign out
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

// Get the current user session
export function getCurrentUser(): User | null {
  return auth.currentUser;
}