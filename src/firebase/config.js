// Guna import pendek seperti ini (Vite akan cari dalam node_modules)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDX6YoN5PHaFrfDPOldNUlYidRJP_Dbfzg",
  authDomain: "p2sa-voting-5d615.firebaseapp.com",
  projectId: "p2sa-voting-5d615",
  storageBucket: "p2sa-voting-5d615.firebasestorage.app",
  messagingSenderId: "440813085825",
  appId: "1:440813085825:web:0a2fb36d4fd8c6fd429980"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service untuk guna dalam Ballot.jsx, Register.jsx, dll
export const db = getFirestore(app);
export const auth = getAuth(app);