import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/models';
import type { UserRecord } from '@/lib/models';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Sign in user with Firebase Admin SDK
    const userCredential = await adminAuth.signInWithEmailAndPassword(email, password);
    
    if (!userCredential || !userCredential.user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    
    const uid = userCredential.user.uid;
    
    // Get user data from Firestore
    const userDocRef = doc(adminDb, COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist (shouldn't happen with properly set up auth)
      const userData: Partial<UserRecord> = {
        id: uid,
        name: userCredential.user.displayName || email.split('@')[0],
        email: email.toLowerCase(),
        role: 'student', // Default role
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await updateDoc(userDocRef, userData);
    } else {
      // Update last login
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
    }
    
    // Create custom token for client auth
    const customToken = await adminAuth.createCustomToken(uid);
    
    // Return user data and token
    const userData = userDoc.exists() ? userDoc.data() as UserRecord : {
      id: uid,
      name: userCredential.user.displayName || email.split('@')[0],
      email: email.toLowerCase(),
      role: 'student'
    };
    
    return NextResponse.json({ 
      token: customToken,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        photoURL: userCredential.user.photoURL || null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login API Error:', error);
    
    if (error instanceof Error) {
      const message = error.message || 'An unexpected error occurred';
      
      // Translate Firebase error messages
      if (message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      } else if (message.includes('auth/too-many-requests')) {
        return NextResponse.json({ message: 'Too many login attempts. Please try again later.' }, { status: 429 });
      } else if (message.includes('auth/user-disabled')) {
        return NextResponse.json({ message: 'This account has been disabled.' }, { status: 403 });
      }
      
      return NextResponse.json({ message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}