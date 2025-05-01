
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"; // Import FirebaseApp type
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics"; // Import isSupported

// import { getFirestore } from "firebase/firestore"; // Uncomment if using Firestore
// import { getFunctions } from "firebase/functions"; // Uncomment if using Cloud Functions
// import { getStorage } from "firebase/storage"; // Uncomment if using Cloud Storage

// --- IMPORTANT: REPLACE PLACEHOLDERS WITH YOUR ACTUAL FIREBASE CONFIG ---
// You need a valid Firebase configuration for the application to work.
// Get your configuration from the Firebase Console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
// -----------------------------------------------------------------------
const firebaseConfig = {
  // V V V --- REPLACE THESE VALUES --- V V V
  apiKey: "YOUR_API_KEY", // <--- REPLACE THIS
  authDomain: "YOUR_AUTH_DOMAIN", // <--- REPLACE THIS
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE THIS
  storageBucket: "YOUR_STORAGE_BUCKET", // <--- REPLACE THIS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE THIS
  appId: "YOUR_APP_ID", // <--- REPLACE THIS
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace if you use Analytics
  // ^ ^ ^ --- REPLACE THESE VALUES --- ^ ^ ^
};


// Initialize Firebase App (check if already initialized)
let app: FirebaseApp; // Declare app using let
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig); // Initialize if no apps exist
    } catch (error) {
        console.error("Error initializing Firebase app:", error);
        // Handle initialization error appropriately, e.g., show an error message to the user
        // For now, we'll throw to make the issue visible during development
        throw new Error("Firebase initialization failed. Please check your firebaseConfig in src/lib/firebase.ts.");
    }

} else {
    app = getApp(); // Get existing app if already initialized
}

// Initialize Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// Initialize Analytics only if supported by the browser environment
let analytics;
if (typeof window !== 'undefined') { // Check if running in a browser
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics initialized.");
      } else {
        console.log("Firebase Analytics is not supported in this environment.");
      }
    }).catch(error => {
        console.error("Error checking Analytics support:", error);
    });
}

// const db = getFirestore(app); // Uncomment if using Firestore
// const functions = getFunctions(app); // Uncomment if using Cloud Functions
// const storage = getStorage(app); // Uncomment if using Cloud Storage


export { app, auth, googleProvider, analytics /*, db, functions, storage */ };

// Add a reminder in the console during development
if (process.env.NODE_ENV === 'development' && firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("🚨 Firebase config is using placeholder values! 🚨\nPlease update src/lib/firebase.ts with your actual Firebase project configuration for the app to function correctly.");
}
