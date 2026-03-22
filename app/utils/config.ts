// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjU5pYrVjxg1cN1avFEvopUYlVStasndI",
  authDomain: "payup-5a145.firebaseapp.com",
  projectId: "payup-5a145",
  storageBucket: "payup-5a145.firebasestorage.app",
  messagingSenderId: "410043313911",
  appId: "1:410043313911:web:ed5497fca12e6515ea2df2",
  measurementId: "G-K82LKQWG1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);