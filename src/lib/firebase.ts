import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-WbOzwgUBvMHMRtARDhs6bg0EhHACsYQ",
  authDomain: "alant-d8eb8.firebaseapp.com",
  projectId: "alant-d8eb8",
  storageBucket: "alant-d8eb8.firebasestorage.app",
  messagingSenderId: "249545022065",
  appId: "1:249545022065:web:54f8888a1f22085ee419d0",
  measurementId: "G-T1BNZ7E4Y0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
let analytics;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, googleProvider, analytics };
