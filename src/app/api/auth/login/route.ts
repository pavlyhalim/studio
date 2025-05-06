// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/models";
import type { UserRecord } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        message: 'Email and password are required' 
      }, { status: 400 });
    }

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData: Partial<UserRecord>;
      
      if (userDoc.exists()) {
        // Update last login time
        await setDoc(userDocRef, { 
          lastLogin: serverTimestamp() 
        }, { merge: true });
        
        userData = userDoc.data() as UserRecord;
      } else {
        // Create user document if it doesn't exist yet
        userData = {
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: email.toLowerCase(),
          role: 'student', // Default role
          createdAt: Date.now(),
          lastLogin: serverTimestamp()
        };
        
        await setDoc(userDocRef, userData);
      }
      
      // Get fresh ID token for client auth
      const token = await user.getIdToken();
      
      // Return user data and token (excluding sensitive fields)
      const { passwordHash, ...safeUserData } = userData as any;
      
      return NextResponse.json({ 
        token, 
        user: safeUserData 
      }, { status: 200 });
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific Firebase Auth errors
      const errorCode = error.code;
      let message = 'Invalid email or password';
      let status = 401;
      
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Too many unsuccessful login attempts. Please try again later.';
        status = 429;
      } else if (errorCode === 'auth/user-disabled') {
        message = 'This account has been disabled.';
        status = 403;
      } else {
        message = error.message || 'An authentication error occurred';
        status = 500;
      }
      
      return NextResponse.json({ message }, { status });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ 
      message: 'An internal server error occurred' 
    }, { status: 500 });
  }
}