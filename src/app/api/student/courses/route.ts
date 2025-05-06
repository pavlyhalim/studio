import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/models';
import type { CourseRecord, EnrollmentRecord } from '@/lib/models';
import { collection, query, where, getDocs } from 'firebase-admin/firestore';

/**
 * Get enrolled courses for authenticated student
 */
export async function GET(request: Request) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: User ID not found' }, { status: 401 });
    }
    
    // Verify user role is student
    if (userRole !== 'student') {
      return NextResponse.json({ message: 'Forbidden: User is not a student' }, { status: 403 });
    }
    
    // Get enrollments for student
    const enrollmentsRef = collection(adminDb, COLLECTIONS.ENROLLMENTS);
    const enrollmentsQuery = query(
      enrollmentsRef,
      where('studentId', '==', userId),
      where('status', '==', 'active')
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EnrollmentRecord[];
    
    if (enrollments.length === 0) {
      return NextResponse.json({ courses: [] }, { status: 200 });
    }
    
    // Get course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    
    // Get courses (process in batches of 10 due to Firestore "in" query limitations)
    const courses: CourseRecord[] = [];
    
    for (let i = 0; i < courseIds.length; i += 10) {
      const batchIds = courseIds.slice(i, i + 10);
      
      const coursesRef = collection(adminDb, COLLECTIONS.COURSES);
      const coursesQuery = query(
        coursesRef,
        where('id', 'in', batchIds),
        where('status', '==', 'active')
      );
      
      const coursesSnapshot = await getDocs(coursesQuery);
      courses.push(...coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseRecord[]);
    }
    
    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error getting student courses:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

/**
 * Enroll student in a course
 */
export async function POST(request: Request) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized: User ID not found' }, { status: 401 });
    }
    
    // Verify user role is student
    if (userRole !== 'student') {
      return NextResponse.json({ message: 'Forbidden: User is not a student' }, { status: 403 });
    }
    
    // Get course ID from request body
    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ message: 'Missing course ID' }, { status: 400 });
    }
    
    // Check if course exists
    const courseRef = adminDb.collection(COLLECTIONS.COURSES).doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    
    // Check if course is active
    const courseData = courseDoc.data();
    if (courseData?.status !== 'active') {
      return NextResponse.json({ message: 'Course is not active' }, { status: 400 });
    }
    
    // Check if student is already enrolled
    const enrollmentsRef = collection(adminDb, COLLECTIONS.ENROLLMENTS);
    const enrollmentsQuery = query(
      enrollmentsRef,
      where('studentId', '==', userId),
      where('courseId', '==', courseId),
      where('status', '==', 'active')
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    
    if (!enrollmentsSnapshot.empty) {
      return NextResponse.json({ message: 'Already enrolled in this course' }, { status: 409 });
    }
    
    // Create enrollment
    const enrollmentRef = adminDb.collection(COLLECTIONS.ENROLLMENTS).doc();
    await enrollmentRef.set({
      id: enrollmentRef.id,
      studentId: userId,
      courseId: courseId,
      enrolledDate: adminDb.Timestamp.now(),
      status: 'active'
    });
    
    return NextResponse.json({ 
      message: 'Successfully enrolled in course',
      enrollmentId: enrollmentRef.id
    }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}