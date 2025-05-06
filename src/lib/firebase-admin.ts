// Firebase Admin SDK Configuration
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check if we're not in a production environment
const isDev = process.env.NODE_ENV !== 'production';

// Parse the service account JSON from environment variable
// This helps avoid having to store the actual JSON file
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
    );
  } else if (isDev) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable not found.');
    console.warn('Firebase Admin will initialize with limited functionality in development mode.');
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is required in production mode');
  }
} catch (error) {
  console.error('Error parsing Firebase service account JSON:', error);
  if (!isDev) {
    throw new Error('Failed to parse Firebase service account credentials. Check your environment variables.');
  }
}

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    initializeApp({
      credential: serviceAccount 
        ? cert(serviceAccount) 
        : (isDev ? undefined : cert(serviceAccount)), // In dev, can initialize without credentials
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin initialized');
  } catch (error: any) {
    if (isDev && error.code === 'app/invalid-credential') {
      console.warn(
        'Firebase Admin initialized without credentials. Some functionality may be limited.'
      );
      // Initialize with a minimal configuration for development
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      console.error('Firebase Admin initialization error:', error);
      if (!isDev) {
        throw error; // In production, we need to fail hard if Firebase Admin can't initialize
      }
    }
  }
}

// Export the services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();