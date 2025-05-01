import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"; // Import Auth type
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics"; // Import Analytics type
import { getFirestore, type Firestore } from "firebase/firestore"; // Import Firestore

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
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID" // Optional
  };

// --- Configuration Validation ---
// Basic validation function
const isConfigInvalid = (config: typeof firebaseConfig): boolean => {
    return Object.entries(config).some(([key, value]) =>
        key !== 'measurementId' && // measurementId is optional
        (!value || value.startsWith('YOUR_') || (key === 'apiKey' && value.length < 10) || (key === 'appId' && !value.includes(':')))
    );
};

if (isConfigInvalid(firebaseConfig)) {
    console.error( // Use error for critical config issues
        "🚨 CRITICAL FIREBASE CONFIG ERROR 🚨\n" +
        `Firebase configuration values in src/lib/firebase.ts or environment variables appear to be placeholders or invalid.\n` +
        "Authentication and other Firebase services WILL FAIL.\n" +
        "1. Ensure Firebase Authentication (and Firestore, etc.) is ENABLED in your Firebase Console.\n" +
        "2. Update your .env file (or environment variables) with your ACTUAL Firebase project configuration values for:\n" +
        Object.entries(firebaseConfig)
            .map(([key, value]) => `   - NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}${key === 'measurementId' ? ' (Optional)' : ''}`)
            .join('\n') + '\n' +
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
let db: Firestore | null = null; // Add Firestore instance variable

if (!getApps().length) {
    try {
        // Attempt initialization only if config doesn't look obviously invalid
        if (!isConfigInvalid(firebaseConfig)) {
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

    try {
        db = getFirestore(app); // Initialize Firestore
        console.log("Firestore initialized.");
    } catch (e) {
        console.error("Firestore init error:", e);
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
    // let functions = null; try { functions = getFunctions(app); console.log("Cloud Functions initialized."); } catch (e) { console.error("Functions init error:", e); }
    // let storage = null; try { storage = getStorage(app); console.log("Cloud Storage initialized."); } catch (e) { console.error("Storage init error:", e); }

} else if (!isConfigInvalid(firebaseConfig)) { // Only show this error if config wasn't obviously wrong initially
    console.error("Firebase app was not initialized successfully, likely due to an error during initializeApp(). Firebase services (Auth, Firestore, etc.) will not be available.");
}

// Export potentially null values - consuming code MUST check for null before using
export { app, auth, googleProvider, analytics, db }; // Export db
