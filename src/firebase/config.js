import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARhrT9WtXetkSSDOe9d_WcwiEYsv1g7LA",
  authDomain: "voting-system-nssb.firebaseapp.com",
  projectId: "voting-system-nssb",
  storageBucket: "voting-system-nssb.firebasestorage.app",
  messagingSenderId: "59837426364",
  appId: "1:59837426364:web:ef4634a8a3265404f7feb9",
  measurementId: "G-C0MV75X36S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export service sahaja
export const db = getFirestore(app);
export const auth = getAuth(app);
export { analytics };