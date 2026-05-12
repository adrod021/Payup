import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
// Deep import to bypass the TypeScript export error
// @ts-ignore
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// initializes firebase app instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// initializes auth with persistence for react native
let auth: Auth;
try {
  auth = getAuth(app);
} catch {
  // Empty catch block fixes the "'e' is defined but never used" error
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// initializes firestore database instance
const db = getFirestore(app);

// Removed 'storage' export since you are on the Free Tier
export { app, auth, db };
