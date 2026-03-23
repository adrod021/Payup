import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_VMe_qtKHjF4x0f5HCIultvkVZMgfyBM",
  authDomain: "payup-app-cse4550.firebaseapp.com",
  projectId: "payup-app-cse4550",
  storageBucket: "payup-app-cse4550.firebasestorage.app",
  messagingSenderId: "131813404781",
  appId: "1:131813404781:web:6519b2587741a4b3cfcf64"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the standard getAuth - it works perfectly with Expo Go
const auth = getAuth(app); 
const db = getFirestore(app);

export { app, auth, db };

