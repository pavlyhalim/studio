// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/models";
import type { UserRecord } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ 
        message: 'Name, email, and password are required' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        message: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      const userData: UserRecord = {
        id: user.uid,
        name,
        email: email.toLowerCase(),
        role: 'student', // Default role for new users
        photoURL: user.photoURL || undefined,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
      
      // Get ID token for client auth
      const token = await user.getIdToken();
      
      // Return user data and token
      const { passwordHash, ...safeUserData } = userData as any;
      
      return NextResponse.json({ 
        token, 
        user: safeUserData 
      }, { status: 201 });
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific Firebase Auth errors
      const errorCode = error.code;
      let message = 'Failed to create account';
      let status = 400;
      
      if (errorCode === 'auth/email-already-in-use') {
        message = 'Email address is already registered';
        status = 409;
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Invalid email address format';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password is too weak. It must be at least 6 characters';
      } else {
        message = error.message || 'An unexpected error occurred during signup';
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