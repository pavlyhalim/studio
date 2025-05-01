
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// import { getFirestore } from "firebase/firestore"; // Uncomment if using Firestore
// import { getFunctions } from "firebase/functions"; // Uncomment if using Cloud Functions
// import { getStorage } from "firebase/storage"; // Uncomment if using Cloud Storage

// --- IMPORTANT: Configuration Error Handling ---
// The error "auth/configuration-not-found" usually means:
// 1. Firebase Authentication is NOT ENABLED for this project in the Firebase Console.
//    -> Go to Firebase Console > Build > Authentication > Get Started, and enable it.
// 2. The `firebaseConfig` values below (especially `apiKey`, `authDomain`, `projectId`)
//    do NOT match the actual Firebase project you intend to use.
//    -> Double-check these values against your project settings in the Firebase Console.
// -----------------------------------------------------------------------
const firebaseConfig = {
    // --- REPLACE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE CONFIG ---
    // Get your configuration from the Firebase Console:
    // Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
    apiKey: "AIzaSyC-WbOzwgUBvMHMRtARDhs6bg0EhHACsYQ", // <-- CHECK THIS VALUE
    authDomain: "alant-d8eb8.firebaseapp.com", // <-- CHECK THIS VALUE
    projectId: "alant-d8eb8", // <-- CHECK THIS VALUE
    storageBucket: "alant-d8eb8.firebasestorage.app",
    messagingSenderId: "249545022065",
    appId: "1:249545022065:web:54f8888a1f22085ee419d0",
    measurementId: "G-T1BNZ7E4Y0"
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
    // Ensure `app` is initialized before calling getAuth
    if (!app) {
        throw new Error("Firebase app failed to initialize before Auth setup.");
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase Auth initialized.");
} catch(error) {
    console.error("Error initializing Firebase Auth:", error);
    // Handle Auth initialization error - maybe disable login features
    // If you see "auth/configuration-not-found", check the Firebase Console
    // to ensure Authentication is enabled for this project.
}


// Initialize Analytics only if supported by the browser environment
if (typeof window !== 'undefined') { // Check if running in a browser
    isSupported().then((supported) => {
      if (supported && app) { // Also check if app is initialized
          try {
             analytics = getAnalytics(app);
             console.log("Firebase Analytics initialized.");
          } catch (error) {
               console.error("Error initializing Firebase Analytics:", error);
          }
      } else if (!supported) {
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
//     if (!app) throw new Error("Firebase app not initialized for Firestore");
//     db = getFirestore(app);
//     console.log("Firestore initialized.");
// } catch (error) {
//     console.error("Error initializing Firestore:", error);
// }

// let functions;
// try {
//     if (!app) throw new Error("Firebase app not initialized for Functions");
//     functions = getFunctions(app);
//     console.log("Cloud Functions initialized.");
// } catch (error) {
//     console.error("Error initializing Cloud Functions:", error);
// }

// let storage;
// try {
//     if (!app) throw new Error("Firebase app not initialized for Storage");
//     storage = getStorage(app);
//     console.log("Cloud Storage initialized.");
// } catch (error) {
//     console.error("Error initializing Cloud Storage:", error);
// }


export { app, auth, googleProvider, analytics /*, db, functions, storage */ };

// Add a reminder in the console during development
if (process.env.NODE_ENV === 'development' && firebaseConfig.apiKey.startsWith("AIza") && firebaseConfig.apiKey.includes("YOUR_API_KEY")) { // More specific check for placeholder
  console.warn(
      "🚨 Firebase config might be using placeholder values! 🚨\n" +
      "Please update src/lib/firebase.ts with your actual Firebase project configuration.\n" +
      "Get your config from Firebase Console: Project settings > General > Your apps > Web app > Config."
  );
}
if (process.env.NODE_ENV === 'development' && !firebaseConfig.apiKey) {
    console.error(
        "🚨 Firebase API Key is missing! 🚨\n" +
        "Authentication and other Firebase services will likely fail.\n" +
        "Please update src/lib/firebase.ts with your actual Firebase project configuration."
    )
}

