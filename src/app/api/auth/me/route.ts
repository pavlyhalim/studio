import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/models';
import type { UserRecord } from '@/lib/models';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    // Get authorization header
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }
    
    // Verify the token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    const uid = decodedToken.uid;
    
    // Get user data from Firestore
    const userDocRef = doc(adminDb, COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Get user from Auth
      try {
        const userRecord = await adminAuth.getUser(uid);
        
        // Create user document in Firestore
        const userData: Partial<UserRecord> = {
          id: uid,
          name: userRecord.displayName || 'Firebase User',
          email: userRecord.email?.toLowerCase(),
          role: 'student', // Default role
          photoURL: userRecord.photoURL || undefined,
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        
        await setDoc(userDocRef, userData);
        
        // Return user data
        return NextResponse.json({
          id: uid,
          name: userRecord.displayName,
          email: userRecord.email,
          role: 'student',
          photoURL: userRecord.photoURL
        }, { status: 200 });
      } catch (error) {
        console.error('User not found in Auth:', error);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
    }
    
    // Update last login
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    });
    
    // Return user data
    const userData = userDoc.data() as UserRecord;
    
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      photoURL: userData.photoURL
    }, { status: 200 });
    
  } catch (error) {
    console.error('/api/auth/me Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}