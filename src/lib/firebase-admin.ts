
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Ensure environment variable is set
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    if (process.env.NODE_ENV === 'production') {
         console.error('Firebase Admin SDK Error: FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.');
         // In production, you might want to throw an error or handle this more gracefully
         // throw new Error('Firebase Admin SDK configuration error.');
    } else {
        console.warn('Firebase Admin SDK Warning: FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. Admin features will not work. Ensure the variable is set in your .env.local file.');
    }
}

// Initialize Firebase Admin SDK only if not already initialized and config is available
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally add databaseURL if needed for Realtime Database
      // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    // Decide how to handle initialization failure. Maybe throw, maybe log and continue?
    // Throwing might be safer to prevent unexpected behavior later.
    // throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    console.error('Firebase Admin SDK will not be available.');
  }
} else if (admin.apps.length) {
    console.log('Using existing Firebase Admin SDK app instance.');
}

// Get admin services only if initialized
const adminAuth = admin.apps.length ? admin.auth() : null;
// const adminDb = admin.apps.length ? admin.firestore() : null; // Uncomment if using Firestore
// const adminStorage = admin.apps.length ? admin.storage() : null; // Uncomment if using Storage

// Export null if not initialized to allow for checking in consuming code
export { adminAuth /*, adminDb, adminStorage */ };
