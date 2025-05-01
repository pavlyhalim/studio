
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"; // Import FirebaseApp type
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics"; // Import isSupported

// import { getFirestore } from "firebase/firestore"; // Uncomment if using Firestore
// import { getFunctions } from "firebase/functions"; // Uncomment if using Cloud Functions
// import { getStorage } from "firebase/storage"; // Uncomment if using Cloud Storage

// IMPORTANT: Replace this with your actual Firebase project configuration
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace with your Measurement ID
};


// Initialize Firebase App (check if already initialized)
let app: FirebaseApp; // Declare app using let
if (!getApps().length) {
    app = initializeApp(firebaseConfig); // Initialize if no apps exist
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
    });
}

// const db = getFirestore(app); // Uncomment if using Firestore
// const functions = getFunctions(app); // Uncomment if using Cloud Functions
// const storage = getStorage(app); // Uncomment if using Cloud Storage


export { app, auth, googleProvider, analytics /*, db, functions, storage */ };

// Add a reminder in the console during development
if (process.env.NODE_ENV === 'development' && firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase config is using placeholder values. Please update src/lib/firebase.ts with your actual Firebase project configuration.");
}

