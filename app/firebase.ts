import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  // @ts-ignore
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

//add the ocr pull


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

// Initialize Auth with persistence
// We use 'as any' here to bypass the TypeScript export bug
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db, storage };

