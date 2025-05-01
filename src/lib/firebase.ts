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
//    do NOT match the actual Firebase project you intend to use, either via environment variables or direct assignment.
//    -> Double-check these values against your project settings in the Firebase Console and your environment variables.
// -----------------------------------------------------------------------
const firebaseConfig = {
    // Read from environment variables, provide placeholders as fallback
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID" // Optional
  };

// --- Configuration Validation ---
// Check if the effective config values are still placeholders
const isConfigPlaceholder =
    !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" ||
    !firebaseConfig.authDomain || firebaseConfig.authDomain.includes("YOUR_AUTH_DOMAIN") ||
    !firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID";

if (isConfigPlaceholder) {
    console.error(
        "🚨 CRITICAL FIREBASE CONFIG ERROR 🚨\n" +
        "Firebase configuration values in src/lib/firebase.ts appear to be placeholders or missing.\n" +
        "Authentication and other Firebase services WILL FAIL.\n" +
        "1. Ensure Firebase Authentication is ENABLED in your Firebase Console.\n" +
        "2. Update src/lib/firebase.ts with your ACTUAL Firebase project configuration OR set the corresponding NEXT_PUBLIC_FIREBASE_* environment variables (check your .env.local file).\n" +
        "Get your config from Firebase Console: Project settings > General > Your apps > Web app > Config."
    );
    // Optionally, throw an error in development to halt execution
    // if (process.env.NODE_ENV === 'development') {
    //     throw new Error("Firebase configuration is missing or invalid. Please check src/lib/firebase.ts and your Firebase Console settings.");
    // }
}


// Initialize Firebase App (check if already initialized)
let app: FirebaseApp | null = null; // Initialize as null
if (!getApps().length) {
    try {
        // Only attempt initialization if config seems valid (not a placeholder)
        if (!isConfigPlaceholder) {
             app = initializeApp(firebaseConfig);
             console.log("Firebase app initialized successfully.");
        } else {
             console.error("Firebase initialization skipped due to invalid or placeholder configuration.");
        }
    } catch (error) {
        console.error("Error initializing Firebase app:", error);
        // Provide a more user-friendly message in the UI if possible,
        // but keep the detailed console error for debugging.
        // Do not throw here, let services handle the uninitialized app state
    }
} else {
    app = getApp();
    console.log("Using existing Firebase app instance.");
}

// Initialize Firebase services only if the app was successfully initialized
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null; // Use null for consistency

if (app) { // Check if app is initialized
    try {
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        console.log("Firebase Auth initialized.");
    } catch(error) {
        console.error("Error initializing Firebase Auth:", error);
        // If you see "auth/configuration-not-found", double-check the Firebase Console
        // to ensure Authentication is enabled for this project and config is correct.
    }

    // Initialize Analytics only if supported by the browser environment
    if (typeof window !== 'undefined') { // Check if running in a browser
        isSupported().then((supported) => {
          if (supported) {
              try {
                 analytics = getAnalytics(app!); // Non-null assertion safe here due to outer 'if (app)'
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
    // let db = null;
    // try {
    //     db = getFirestore(app);
    //     console.log("Firestore initialized.");
    // } catch (error) {
    //     console.error("Error initializing Firestore:", error);
    // }

    // let functions = null;
    // try {
    //     functions = getFunctions(app);
    //     console.log("Cloud Functions initialized.");
    // } catch (error) {
    //     console.error("Error initializing Cloud Functions:", error);
    // }

    // let storage = null;
    // try {
    //     storage = getStorage(app);
    //     console.log("Cloud Storage initialized.");
    // } catch (error) {
    //     console.error("Error initializing Cloud Storage:", error);
    // }

} else {
    console.error("Firebase app was not initialized. Firebase services (Auth, Analytics, etc.) will not be available.");
}


// Export potentially null values - consuming code must check
export { app, auth, googleProvider, analytics /*, db, functions, storage */ };