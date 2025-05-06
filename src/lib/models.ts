// Type definitions for all models in Firestore
export interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'professor' | 'admin';
    photoURL?: string;
    createdAt: Date | number; // Firebase Timestamp gets converted
    lastLogin?: Date | number;
    // Note: passwordHash is not stored in Firestore, handled by Firebase Auth
  }
  
  export interface CourseRecord {
    id: string;
    title: string;
    description: string;
    professorId: string; // ID of the professor teaching the course
    createdAt: Date | number;
    updatedAt: Date | number;
    status: 'active' | 'archived' | 'draft';
  }
  
  export interface EnrollmentRecord {
    id: string;
    studentId: string;
    courseId: string;
    enrolledDate: Date | number;
    status: 'active' | 'dropped' | 'completed';
  }
  
  export interface AssignmentRecord {
    id: string;
    courseId: string;
    title: string;
    description: string;
    dueDate: Date | number;
    maxScore: number;
    createdAt: Date | number;
    updatedAt: Date | number;
    type: 'quiz' | 'problem_set' | 'essay' | 'project' | 'other';
  }
  
  export interface GradeRecord {
    id: string;
    studentId: string;
    assignmentId: string;
    courseId: string; // Denormalized for easier queries
    score: number;
    gradedDate: Date | number;
    feedback?: string;
    graderId: string; // Professor or system that graded it
  }
  
  export interface AnnouncementRecord {
    id: string;
    courseId: string;
    title: string;
    content: string;
    postedDate: Date | number;
    professorId: string;
    pinned?: boolean;
  }
  
  export interface FileRecord {
    id: string;
    courseId: string;
    professorId: string;
    fileName: string;
    fileType: string;
    uploadDate: Date | number;
    storageRef: string; // Path in Firebase Storage
    sizeKB: number;
    accessLevel: 'public' | 'course' | 'restricted';
  }
  
  // Optional: Add a type for AI chat history
  export interface AIMessageRecord {
    id: string;
    userId: string;
    query: string;
    response: string;
    timestamp: Date | number;
    metadata?: {
      courseContext?: string;
      usedExternalKnowledge?: boolean;
      toolsUsed?: string[];
    };
  }
  
  // Firestore collection names 
  export const COLLECTIONS = {
    USERS: 'users',
    COURSES: 'courses',
    ENROLLMENTS: 'enrollments',
    ASSIGNMENTS: 'assignments',
    GRADES: 'grades',
    ANNOUNCEMENTS: 'announcements',
    FILES: 'files',
    AI_MESSAGES: 'ai_messages'
  };