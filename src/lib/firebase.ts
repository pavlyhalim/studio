
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// import { getFirestore } from "firebase/firestore"; // Uncomment if using Firestore
// import { getFunctions } from "firebase/functions"; // Uncomment if using Cloud Functions
// import { getStorage } from "firebase/storage"; // Uncomment if using Cloud Storage

// --- IMPORTANT: REPLACE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE CONFIG ---
// Get your configuration from the Firebase Console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
// -----------------------------------------------------------------------
const firebaseConfig = {
  // V V V --- REPLACE THESE VALUES --- V V V
  apiKey: "YOUR_API_KEY", // <--- REPLACE THIS (Required for Auth, Installations, etc.)
  authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com", // <--- REPLACE THIS
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE THIS
  storageBucket: "YOUR_STORAGE_BUCKET.appspot.com", // <--- REPLACE THIS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE THIS
  appId: "YOUR_APP_ID", // <--- REPLACE THIS
  measurementId: "G-YOUR_MEASUREMENT_ID" // Optional: Replace if you use Analytics
  // ^ ^ ^ --- REPLACE THESE VALUES --- ^ ^ ^
};


// Initialize Firebase App (check if already initialized)
let app: FirebaseApp;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized successfully.");
    } catch (error) {
        console.error("Error initializing Firebase app:", error);
        // Provide a more user-friendly message in the UI if possible,
        // but keep the detailed console error for debugging.
        throw new Error("Firebase initialization failed. Please check your firebaseConfig in src/lib/firebase.ts and ensure the values are correct.");
    }
} else {
    app = getApp();
    console.log("Using existing Firebase app instance.");
}

// Initialize Firebase services
let auth: ReturnType<typeof getAuth>;
let googleProvider: GoogleAuthProvider;
let analytics: ReturnType<typeof getAnalytics> | undefined;

try {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase Auth initialized.");
} catch(error) {
    console.error("Error initializing Firebase Auth:", error);
    // Handle Auth initialization error - maybe disable login features
}


// Initialize Analytics only if supported by the browser environment
if (typeof window !== 'undefined') { // Check if running in a browser
    isSupported().then((supported) => {
      if (supported) {
          try {
             analytics = getAnalytics(app);
             console.log("Firebase Analytics initialized.");
          } catch (error) {
               console.error("Error initializing Firebase Analytics:", error);
          }
      } else {
        console.log("Firebase Analytics is not supported in this environment.");
      }
    }).catch(error => {
        console.error("Error checking Analytics support:", error);
    });
} else {
    console.log("Not in a browser environment, skipping Analytics initialization.");
}


// Uncomment and initialize other services as needed, wrapping in try...catch
// let db;
// try {
//     db = getFirestore(app);
//     console.log("Firestore initialized.");
// } catch (error) {
//     console.error("Error initializing Firestore:", error);
// }

// let functions;
// try {
//     functions = getFunctions(app);
//     console.log("Cloud Functions initialized.");
// } catch (error) {
//     console.error("Error initializing Cloud Functions:", error);
// }

// let storage;
// try {
//     storage = getStorage(app);
//     console.log("Cloud Storage initialized.");
// } catch (error) {
//     console.error("Error initializing Cloud Storage:", error);
// }


export { app, auth, googleProvider, analytics /*, db, functions, storage */ };

// Add a reminder in the console during development
if (process.env.NODE_ENV === 'development' && firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn(
      "🚨 Firebase config is using placeholder values! 🚨\n" +
      "Please update src/lib/firebase.ts with your actual Firebase project configuration.\n" +
      "Get your config from Firebase Console: Project settings > General > Your apps > Web app > Config."
  );
}
