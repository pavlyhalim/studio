import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/models';
import type { CourseRecord } from '@/lib/models';
import { collection, query, where, getDocs, orderBy } from 'firebase-admin/firestore';

/**
 * Get courses taught by authenticated professor
 */
export async function GET(request: Request) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: User ID not found' }, { status: 401 });
    }
    
    // Verify user role is professor
    if (userRole !== 'professor') {
      return NextResponse.json({ message: 'Forbidden: User is not a professor' }, { status: 403 });
    }
    
    // Get courses for professor
    const coursesRef = collection(adminDb, COLLECTIONS.COURSES);
    const coursesQuery = query(
      coursesRef,
      where('professorId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CourseRecord[];
    
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error getting professor courses:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

/**
 * Create a new course
 */
export async function POST(request: Request) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: User ID not found' }, { status: 401 });
    }
    
    // Verify user role is professor or admin
    if (userRole !== 'professor' && userRole !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: User is not authorized to create courses' }, { status: 403 });
    }
    
    // Get course data from request body
    const { title, description } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ message: 'Missing required fields: title and description' }, { status: 400 });
    }
    
    // Check if course with same title already exists
    const coursesRef = collection(adminDb, COLLECTIONS.COURSES);
    const existingQuery = query(
      coursesRef,
      where('title', '==', title),
      where('status', '==', 'active')
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      return NextResponse.json({ message: 'A course with this title already exists' }, { status: 409 });
    }
    
    // Create course
    const courseRef = adminDb.collection(COLLECTIONS.COURSES).doc();
    const now = adminDb.Timestamp.now();
    
    await courseRef.set({
      id: courseRef.id,
      title,
      description,
      professorId: userId,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    });
    
    return NextResponse.json({ 
      message: 'Course created successfully',
      courseId: courseRef.id,
      course: {
        id: courseRef.id,
        title,
        description,
        professorId: userId,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}