// src/lib/firebase-admin.ts

import { cert, getApps, initializeApp, AppOptions } from 'firebase-admin/app';
import { getAuth }  from 'firebase-admin/auth';
import { getFirestore }  from 'firebase-admin/firestore';
import { getStorage }  from 'firebase-admin/storage';
import { existsSync } from 'fs';
import { join }     from 'path';

const isDev = process.env.NODE_ENV !== 'production';
const options: AppOptions = {};

// 1) Try parsing credentials from env var
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
    options.credential = cert(serviceAccount);
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', e);
    if (!isDev) throw new Error('Invalid service account JSON in env var');
  }
}
// 2) Fallback to the JSON file in src/lib if it exists
else {
  const keyPath = join(process.cwd(), 'src/lib/serviceAccountKey.json');
  if (existsSync(keyPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(keyPath);
    options.credential = cert(serviceAccount);
  } else if (isDev) {
    console.warn('No service account credentials found; running in dev without admin credential');
    // In dev mode, Admin SDK will use Application Default Credentials or limited functionality
  } else {
    throw new Error(
      'Missing Firebase service account credentials. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_KEY_JSON or place serviceAccountKey.json in src/lib'
    );
  }
}

// 3) Include storageBucket if configured
if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  options.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
}

// Initialize the Admin app once
if (!getApps().length) {
  initializeApp(options);
  console.log('✅ Firebase Admin initialized');
}

export const adminAuth    = getAuth();
export const adminDb      = getFirestore();
export const adminStorage = getStorage();
