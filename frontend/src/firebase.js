// src/firebase.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js"; 
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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

// Export service yang kita nak guna
export const db = getFirestore(app);
export const auth = getAuth(app);