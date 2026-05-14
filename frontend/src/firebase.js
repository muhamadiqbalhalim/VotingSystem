// Guna import pendek seperti ini (Vite akan cari dalam node_modules)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCno2NNkzt3gLdC4CfZ4TlhwESQJgI_IXk",
    authDomain: "test-login2-e4c7f.firebaseapp.com",
    projectId: "test-login2-e4c7f",
    storageBucket: "test-login2-e4c7f.appspot.com",
    messagingSenderId: "698181085162",
    appId: "1:698181085162:web:3b91954eb1779a05894cd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service untuk guna dalam Ballot.jsx, Register.jsx, dll
export const db = getFirestore(app);
export const auth = getAuth(app);