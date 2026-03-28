import { createUserWithEmailAndPassword, signOut as firebaseSignOut, signInWithEmailAndPassword, updateProfile, User } from "firebase/auth";

// This connects to your specific Firebase setup
import { auth } from "../firebase";

// This function creates a new user and sets up their display name correctly
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 1. Save the name to the Firebase profile
  await updateProfile(credential.user, {
    displayName: displayName,
  });

  // 2. Refresh the local user data so the name shows up right away
  await credential.user.getIdToken(true);

  // 3. Reload the user information to be sure it's updated
  await credential.user.reload();

  // 4. Return the fully updated user
  return auth.currentUser!; 
}

// This function logs in an existing user with their email and password
export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user; 
}

// This function signs the user out of the app
export async function logout(): Promise<void> {
  // Uses the Firebase command to end the session
  await firebaseSignOut(auth);
}

// This simple helper check who is currently logged in
export function getCurrentUser(): User | null {
  return auth.currentUser;
}