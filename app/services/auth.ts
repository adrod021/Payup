// services/auth.ts
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  updateProfile,
  User
} from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "../firebase";

export async function signUp(
  email: string, 
  password: string, 
  username: string, 
  phoneNumber: string
): Promise<User> {
  
  // 1. Pre-check for duplicate phone numbers
  if (phoneNumber) {
    const q = query(collection(db, "users"), where("phoneNumber", "==", phoneNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("This phone number is already registered.");
    }
  }

  // 2. Create the user in Firebase Auth
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 3. Update the Auth Profile first
  await updateProfile(credential.user, { displayName: username });

  // 4. We must ensure the Firestore document exists before the UI tries to read it.
  const userDocData = {
    uid: credential.user.uid,
    // Store original email if not a placeholder, else null
    email: email.toLowerCase().includes("payup-placeholder.com") ? null : email.toLowerCase(),
    phoneNumber: phoneNumber || null,
    username: username, 
    role: "user", 
    signupMethod: phoneNumber ? 'phone' : 'email',
    createdAt: new Date().toISOString()
  };

  // Wait for Firestore to confirm the write
  await setDoc(doc(db, "users", credential.user.uid), userDocData);

  // Reload to ensure the displayName and metadata are fresh
  await credential.user.reload();
  
  return auth.currentUser!; 
}

export async function login(identifier: string, password: string): Promise<User> {
  const isEmail = identifier.includes('@');
  // Ensure lowercase for consistency
  const loginEmail = isEmail ? identifier.toLowerCase().trim() : `${identifier.trim()}@payup-placeholder.com`;
  
  const credential = await signInWithEmailAndPassword(auth, loginEmail, password);
  return credential.user; 
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}