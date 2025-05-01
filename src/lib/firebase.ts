import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"; // Import Auth type
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics"; // Import Analytics type

// import { getFirestore } from "firebase/firestore"; // Uncomment if using Firestore
// import { getFunctions } from "firebase/functions"; // Uncomment if using Cloud Functions
// import { getStorage } from "firebase/storage"; // Uncomment if using Cloud Storage

// --- IMPORTANT: Configuration Error Handling ---
// Errors like "auth/configuration-not-found" or "installations/request-failed" (400 INVALID_ARGUMENT: API key not valid) usually mean:
// 1. Firebase Authentication is NOT ENABLED for this project in the Firebase Console.
//    -> Go to Firebase Console > Build > Authentication > Get Started, and enable it (e.g., Google, Email/Password).
// 2. The `firebaseConfig` values below (especially `apiKey`, `authDomain`, `projectId`)
//    do NOT match the actual Firebase project you intend to use, either via environment variables or direct assignment.
//    -> Double-check these values against your project settings in the Firebase Console and your environment variables.
// -----------------------------------------------------------------------
const firebaseConfig = {
    // Read from environment variables, provide explicit placeholders as fallback
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alant-d8eb8.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alant-d8eb8",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alant-d8eb8.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "249545022065",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-487727789" // Optional
  };

// --- Configuration Validation ---
const isApiKeyInvalid = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey.length < 10; // Basic check
const isAppIdInvalid = !firebaseConfig.appId || firebaseConfig.appId === "YOUR_APP_ID" || !firebaseConfig.appId.includes(":"); // Basic check

if (isApiKeyInvalid || isAppIdInvalid) {
    console.error( // Use error for critical config issues
        "🚨 CRITICAL FIREBASE CONFIG ERROR 🚨\n" +
        `Firebase configuration values in src/lib/firebase.ts appear to be placeholders or invalid (API Key: ${isApiKeyInvalid ? 'INVALID/MISSING' : 'OK'}, App ID: ${isAppIdInvalid ? 'INVALID/MISSING' : 'OK'}).\n` +
        "Authentication and other Firebase services WILL FAIL.\n" +
        "1. Ensure Firebase Authentication is ENABLED in your Firebase Console (and any other required services).\n" +
        "2. Update your .env file (or environment variables) with your ACTUAL Firebase project configuration values for:\n" +
        `   - NEXT_PUBLIC_FIREBASE_API_KEY (currently looks ${isApiKeyInvalid ? 'INVALID' : 'valid'})\n` +
        `   - NEXT_PUBLIC_FIREBASE_APP_ID (currently looks ${isAppIdInvalid ? 'INVALID' : 'valid'})\n` +
        "   - ... and other NEXT_PUBLIC_FIREBASE_* variables.\n" +
        "3. Get your config from Firebase Console: Project settings > General > Your apps > Web app > Config.\n" +
        "4. Restart your Next.js development server after updating environment variables."
    );
} else if (process.env.NODE_ENV === 'development') {
     // Log masked API key in development to help debugging without exposing the full key
     const maskedApiKey = firebaseConfig.apiKey.substring(0, 4) + '...' + firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length - 4);
     console.log(`Firebase Config Check: Using Project ID "${firebaseConfig.projectId}", API Key starting with "${maskedApiKey}"`);
}


// Initialize Firebase App (check if already initialized)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let analytics: Analytics | null = null;

if (!getApps().length) {
    try {
        // Attempt initialization only if config doesn't look obviously invalid
        if (!isApiKeyInvalid && !isAppIdInvalid) {
            app = initializeApp(firebaseConfig);
            console.log("Firebase app initialization attempted.");
        } else {
             console.error("Skipping Firebase app initialization due to invalid configuration.");
        }
    } catch (error) {
        console.error("Error initializing Firebase app:", error);
        // Log specific error details if available
        if (error instanceof Error) {
             console.error("Firebase Initialization Error Message:", error.message);
        }
    }
} else {
    app = getApp();
    console.log("Using existing Firebase app instance.");
}

// Initialize Firebase services only if the app was successfully initialized
if (app) {
    try {
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        console.log("Firebase Auth initialized.");
    } catch(error) {
        console.error("Error initializing Firebase Auth:", error);
        // Provide specific guidance for common auth errors
        if (error instanceof Error && error.message.includes('auth/configuration-not-found')) {
             console.error("Hint: Ensure Authentication is enabled in your Firebase Console (Build > Authentication > Get Started).");
        }
    }

    // Initialize Analytics only if supported by the browser environment
    if (typeof window !== 'undefined') {
        isSupported().then((supported) => {
          if (supported) {
              try {
                 analytics = getAnalytics(app!);
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
    }

    // Uncomment and initialize other services as needed
    // let db = null; try { db = getFirestore(app); console.log("Firestore initialized."); } catch (e) { console.error("Firestore init error:", e); }
    // let functions = null; try { functions = getFunctions(app); console.log("Cloud Functions initialized."); } catch (e) { console.error("Functions init error:", e); }
    // let storage = null; try { storage = getStorage(app); console.log("Cloud Storage initialized."); } catch (e) { console.error("Storage init error:", e); }

} else if (!isApiKeyInvalid && !isAppIdInvalid) { // Only show this error if config wasn't obviously wrong initially
    console.error("Firebase app was not initialized successfully, likely due to an error during initializeApp(). Firebase services (Auth, Analytics, etc.) will not be available.");
}

// Export potentially null values - consuming code MUST check for null before using
export { app, auth, googleProvider, analytics /*, db, functions, storage */ };
