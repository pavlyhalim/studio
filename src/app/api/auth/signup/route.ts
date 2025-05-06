import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/models';
import type { UserRecord } from '@/lib/models';
import { setDoc, doc, serverTimestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    try {
      // Check if user already exists by email
      const userRecord = await adminAuth.getUserByEmail(email).catch(() => null);
      
      if (userRecord) {
        return NextResponse.json({ message: 'Email address is already registered' }, { status: 409 });
      }
    } catch (error: any) {
      // Continue if user not found (expected behavior)
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false // Set to true to skip email verification
    });

    // Create user document in Firestore
    const userData: UserRecord = {
      id: userRecord.uid,
      name,
      email: email.toLowerCase(),
      role: 'student', // Default role
      photoURL: userRecord.photoURL || undefined,
      createdAt: Date.now(), // Server timestamp
      lastLogin: Date.now()
    };

    await setDoc(doc(adminDb, COLLECTIONS.USERS, userRecord.uid), userData);

    // Create custom token for client auth
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      token: customToken,
      user: {
        id: userRecord.uid,
        name,
        email,
        role: 'student',
        photoURL: userRecord.photoURL || null
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup API Error:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ message: 'Email address is already registered' }, { status: 409 });
    } else if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ message: 'Invalid email address format' }, { status: 400 });
    } else if (error.code === 'auth/weak-password') {
      return NextResponse.json({ message: 'Password is too weak. It must be at least 6 characters' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: error.message || 'An unexpected error occurred during signup' 
    }, { status: 500 });
  }
}