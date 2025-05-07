// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider }         from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage }    from 'firebase/storage';

// 1) Your client‐side Firebase config
// Ensure all NEXT_PUBLIC_… env vars are set in .env.local
const firebaseConfig = {
  apiKey:              process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:       process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:   process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:               process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 2) Initialize (or reuse) your Firebase “app”
const app: FirebaseApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp(firebaseConfig);

// 3) Auth + Google provider
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 4) Firestore with long-polling fallback
export const db: Firestore = initializeFirestore(app, {
  // This makes Firestore use plain HTTP long-polling
  // instead of streaming, which avoids network blocks
  experimentalForceLongPolling: true,
  useFetchStreams:             false,
});

// 5) Storage
export const storage: FirebaseStorage = getStorage(app);
