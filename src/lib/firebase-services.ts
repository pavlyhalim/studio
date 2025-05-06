// src/lib/firebase-services.ts
import { db, auth, storage } from "./firebase";
import { 
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, serverTimestamp, Timestamp, 
  DocumentReference, DocumentData, QueryConstraint
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  signOut as firebaseSignOut
} from "firebase/auth";
import { COLLECTIONS, type UserRecord, type CourseRecord, type EnrollmentRecord, 
  type AssignmentRecord, type GradeRecord, type AnnouncementRecord, type FileRecord } from "./models";

// ----- User Management -----

// Create a new user with email and password (client side)
export const createUser = async (
  name: string, 
  email: string, 
  password: string, 
  role: 'student' | 'professor' | 'admin' = 'student'
): Promise<UserRecord> => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    const userDoc: UserRecord = {
      id: user.uid,
      name: name,
      email: email.toLowerCase(),
      role: role,
      photoURL: user.photoURL || undefined,
      createdAt: serverTimestamp() as unknown as number,
      lastLogin: serverTimestamp() as unknown as number
    };
    
    // Add user to Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);
    
    return userDoc;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Sign in user with email and password
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
      lastLogin: serverTimestamp()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      const newUser: UserRecord = {
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email!.toLowerCase(),
        role: 'student', // Default role for Google sign-ins
        photoURL: user.photoURL || undefined,
        createdAt: serverTimestamp() as unknown as number,
        lastLogin: serverTimestamp() as unknown as number
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), newUser);
    } else {
      // Update last login
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        lastLogin: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserRecord | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) return null;
    
    return userDoc.data() as UserRecord;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<UserRecord>) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // If name is updated, update Auth profile as well
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.name
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// ----- Course Management -----

// Create a new course
export const createCourse = async (courseData: Omit<CourseRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CourseRecord> => {
  try {
    const courseRef = collection(db, COLLECTIONS.COURSES);
    const newCourse: Omit<CourseRecord, 'id'> = {
      ...courseData,
      createdAt: serverTimestamp() as unknown as number,
      updatedAt: serverTimestamp() as unknown as number,
      status: 'active'
    };
    
    const docRef = await addDoc(courseRef, newCourse);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...newCourse
    } as CourseRecord;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (courseId: string): Promise<CourseRecord | null> => {
  try {
    const courseDoc = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
    if (!courseDoc.exists()) return null;
    
    return { id: courseDoc.id, ...courseDoc.data() } as CourseRecord;
  } catch (error) {
    console.error("Error getting course:", error);
    throw error;
  }
};

// Get courses taught by a professor
export const getCoursesByProfessor = async (professorId: string): Promise<CourseRecord[]> => {
  try {
    const coursesQuery = query(
      collection(db, COLLECTIONS.COURSES),
      where("professorId", "==", professorId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CourseRecord);
  } catch (error) {
    console.error("Error getting professor courses:", error);
    throw error;
  }
};

// Get all active courses
export const getAllActiveCourses = async (): Promise<CourseRecord[]> => {
  try {
    const coursesQuery = query(
      collection(db, COLLECTIONS.COURSES),
      where("status", "==", "active"),
      orderBy("title")
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CourseRecord);
  } catch (error) {
    console.error("Error getting active courses:", error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (courseId: string, data: Partial<CourseRecord>) => {
  try {
    const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
    await updateDoc(courseRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Archive a course (soft delete)
export const archiveCourse = async (courseId: string) => {
  try {
    const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
    await updateDoc(courseRef, {
      status: 'archived',
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error archiving course:", error);
    throw error;
  }
};

// ----- Enrollment Management -----

// Enroll a student in a course
export const enrollStudent = async (studentId: string, courseId: string): Promise<EnrollmentRecord> => {
  try {
    // Check if already enrolled
    const existingQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId),
      where("status", "==", "active")
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error("Student is already enrolled in this course");
    }
    
    const enrollmentRef = collection(db, COLLECTIONS.ENROLLMENTS);
    const newEnrollment: Omit<EnrollmentRecord, 'id'> = {
      studentId,
      courseId,
      enrolledDate: serverTimestamp() as unknown as number,
      status: 'active'
    };
    
    const docRef = await addDoc(enrollmentRef, newEnrollment);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...newEnrollment
    } as EnrollmentRecord;
  } catch (error) {
    console.error("Error enrolling student:", error);
    throw error;
  }
};

// Get courses a student is enrolled in
export const getStudentCourses = async (studentId: string): Promise<CourseRecord[]> => {
  try {
    // Get active enrollments for student
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) return [];
    
    // Get course data for each enrollment
    const courses: CourseRecord[] = [];
    
    // Process in batches of 10 (Firestore limit for "in" queries)
    for (let i = 0; i < courseIds.length; i += 10) {
      const batch = courseIds.slice(i, i + 10);
      
      const coursesQuery = query(
        collection(db, COLLECTIONS.COURSES),
        where("id", "in", batch),
        where("status", "==", "active")
      );
      
      const coursesSnapshot = await getDocs(coursesQuery);
      courses.push(...coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CourseRecord));
    }
    
    return courses;
  } catch (error) {
    console.error("Error getting student courses:", error);
    throw error;
  }
};

// Get students enrolled in a course
export const getEnrolledStudents = async (courseId: string): Promise<UserRecord[]> => {
  try {
    // Get active enrollments for course
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("courseId", "==", courseId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const studentIds = enrollmentsSnapshot.docs.map(doc => doc.data().studentId);
    
    if (studentIds.length === 0) return [];
    
    // Get user data for each student
    const students: UserRecord[] = [];
    
    // Process in batches of 10 (Firestore limit for "in" queries)
    for (let i = 0; i < studentIds.length; i += 10) {
      const batch = studentIds.slice(i, i + 10);
      
      const studentsQuery = query(
        collection(db, COLLECTIONS.USERS),
        where("id", "in", batch),
        where("role", "==", "student")
      );
      
      const studentsSnapshot = await getDocs(studentsQuery);
      students.push(...studentsSnapshot.docs.map(doc => doc.data() as UserRecord));
    }
    
    return students;
  } catch (error) {
    console.error("Error getting enrolled students:", error);
    throw error;
  }
};

// Drop a student from a course
export const dropEnrollment = async (studentId: string, courseId: string) => {
  try {
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    
    if (enrollmentsSnapshot.empty) {
      throw new Error("Student is not enrolled in this course");
    }
    
    // Update status to dropped
    const enrollmentDoc = enrollmentsSnapshot.docs[0];
    await updateDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentDoc.id), {
      status: 'dropped'
    });
    
    return true;
  } catch (error) {
    console.error("Error dropping enrollment:", error);
    throw error;
  }
};

// ----- Assignment Management -----

// Create an assignment
export const createAssignment = async (assignmentData: Omit<AssignmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentRecord> => {
  try {
    const assignmentRef = collection(db, COLLECTIONS.ASSIGNMENTS);
    const newAssignment: Omit<AssignmentRecord, 'id'> = {
      ...assignmentData,
      createdAt: serverTimestamp() as unknown as number,
      updatedAt: serverTimestamp() as unknown as number
    };
    
    const docRef = await addDoc(assignmentRef, newAssignment);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...newAssignment
    } as AssignmentRecord;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

// Get assignments for a course
export const getCourseAssignments = async (courseId: string): Promise<AssignmentRecord[]> => {
  try {
    const assignmentsQuery = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where("courseId", "==", courseId),
      orderBy("dueDate", "asc")
    );
    
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    return assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AssignmentRecord);
  } catch (error) {
    console.error("Error getting course assignments:", error);
    throw error;
  }
};

// Get upcoming assignments for a student
export const getUpcomingAssignments = async (studentId: string, daysAhead: number = 14): Promise<AssignmentRecord[]> => {
  try {
    // Get active enrollments
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) return [];
    
    // Calculate cutoff date
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    // Get assignments due in the time range, processing in batches
    const assignments: AssignmentRecord[] = [];
    
    for (let i = 0; i < courseIds.length; i += 10) {
      const batchCourseIds = courseIds.slice(i, i + 10);
      
      const assignmentsQuery = query(
        collection(db, COLLECTIONS.ASSIGNMENTS),
        where("courseId", "in", batchCourseIds),
        where("dueDate", ">=", now),
        where("dueDate", "<=", cutoffDate),
        orderBy("dueDate", "asc")
      );
      
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      assignments.push(...assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AssignmentRecord));
    }
    
    return assignments;
  } catch (error) {
    console.error("Error getting upcoming assignments:", error);
    throw error;
  }
};

// ----- Grade Management -----

// Submit a grade
export const submitGrade = async (gradeData: Omit<GradeRecord, 'id' | 'gradedDate'>): Promise<GradeRecord> => {
  try {
    // Check if grade already exists
    const existingQuery = query(
      collection(db, COLLECTIONS.GRADES),
      where("studentId", "==", gradeData.studentId),
      where("assignmentId", "==", gradeData.assignmentId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Update existing grade
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(doc(db, COLLECTIONS.GRADES, existingDoc.id), {
        score: gradeData.score,
        feedback: gradeData.feedback,
        graderId: gradeData.graderId,
        gradedDate: serverTimestamp()
      });
      
      return {
        id: existingDoc.id,
        ...existingDoc.data(),
        score: gradeData.score,
        feedback: gradeData.feedback,
        graderId: gradeData.graderId,
        gradedDate: serverTimestamp() as unknown as number
      } as GradeRecord;
    }
    
    // Create new grade
    const gradeRef = collection(db, COLLECTIONS.GRADES);
    const newGrade: Omit<GradeRecord, 'id'> = {
      ...gradeData,
      gradedDate: serverTimestamp() as unknown as number
    };
    
    const docRef = await addDoc(gradeRef, newGrade);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...newGrade
    } as GradeRecord;
  } catch (error) {
    console.error("Error submitting grade:", error);
    throw error;
  }
};

// Get grades for a student
export const getStudentGrades = async (studentId: string): Promise<GradeRecord[]> => {
  try {
    const gradesQuery = query(
      collection(db, COLLECTIONS.GRADES),
      where("studentId", "==", studentId),
      orderBy("gradedDate", "desc")
    );
    
    const gradesSnapshot = await getDocs(gradesQuery);
    return gradesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as GradeRecord);
  } catch (error) {
    console.error("Error getting student grades:", error);
    throw error;
  }
};

// Get grades for a course assignment
export const getAssignmentGrades = async (assignmentId: string): Promise<GradeRecord[]> => {
  try {
    const gradesQuery = query(
      collection(db, COLLECTIONS.GRADES),
      where("assignmentId", "==", assignmentId),
      orderBy("gradedDate", "desc")
    );
    
    const gradesSnapshot = await getDocs(gradesQuery);
    return gradesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as GradeRecord);
  } catch (error) {
    console.error("Error getting assignment grades:", error);
    throw error;
  }
};

// ----- Announcement Management -----

// Create an announcement
export const createAnnouncement = async (announcementData: Omit<AnnouncementRecord, 'id' | 'postedDate'>): Promise<AnnouncementRecord> => {
  try {
    const announcementRef = collection(db, COLLECTIONS.ANNOUNCEMENTS);
    const newAnnouncement: Omit<AnnouncementRecord, 'id'> = {
      ...announcementData,
      postedDate: serverTimestamp() as unknown as number,
    };
    
    const docRef = await addDoc(announcementRef, newAnnouncement);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...newAnnouncement
    } as AnnouncementRecord;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

// Get announcements for a course
export const getCourseAnnouncements = async (courseId: string, limit?: number): Promise<AnnouncementRecord[]> => {
  try {
    let announcementsQuery = query(
      collection(db, COLLECTIONS.ANNOUNCEMENTS),
      where("courseId", "==", courseId),
      orderBy("postedDate", "desc")
    );
    
    if (limit) {
      announcementsQuery = query(announcementsQuery, limit(limit));
    }
    
    const announcementsSnapshot = await getDocs(announcementsQuery);
    return announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AnnouncementRecord);
  } catch (error) {
    console.error("Error getting course announcements:", error);
    throw error;
  }
};

// Get announcements for a student across enrolled courses
export const getStudentAnnouncements = async (studentId: string, limitPerCourse: number = 5): Promise<AnnouncementRecord[]> => {
  try {
    // Get active enrollments
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) return [];
    
    // Get announcements for each course, process in batches
    const allAnnouncements: AnnouncementRecord[] = [];
    
    for (let i = 0; i < courseIds.length; i += 10) {
      const batchCourseIds = courseIds.slice(i, i + 10);
      
      const announcementsQuery = query(
        collection(db, COLLECTIONS.ANNOUNCEMENTS),
        where("courseId", "in", batchCourseIds),
        orderBy("postedDate", "desc"),
        limit(batchCourseIds.length * limitPerCourse) // Limit per batch
      );
      
      const announcementsSnapshot = await getDocs(announcementsQuery);
      allAnnouncements.push(...announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AnnouncementRecord));
    }
    
    // Sort all announcements by date (newest first)
    return allAnnouncements.sort((a, b) => {
      const dateA = a.postedDate instanceof Date ? a.postedDate.getTime() : a.postedDate as number;
      const dateB = b.postedDate instanceof Date ? b.postedDate.getTime() : b.postedDate as number;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting student announcements:", error);
    throw error;
  }
};

// Delete an announcement
export const deleteAnnouncement = async (announcementId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId));
    return true;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// ----- File Management -----

// Upload a file to Firebase Storage and record in Firestore
export const uploadFile = async (
  file: File, 
  courseId: string, 
  professorId: string, 
  accessLevel: 'public' | 'course' | 'restricted' = 'course'
): Promise<FileRecord> => {
  try {
    // Create storage path: courses/{courseId}/files/{uniqueFileName}
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = `courses/${courseId}/files/${uniqueFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Wait for upload to complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create record in Firestore
    const fileRecord: Omit<FileRecord, 'id'> = {
      courseId,
      professorId,
      fileName: file.name,
      fileType: file.type || `application/${fileExtension}`,
      uploadDate: serverTimestamp() as unknown as number,
      storageRef: storagePath,
      sizeKB: Math.round(file.size / 1024),
      accessLevel
    };
    
    const fileRef = collection(db, COLLECTIONS.FILES);
    const docRef = await addDoc(fileRef, fileRecord);
    
    // Update document with its ID
    await updateDoc(docRef, { id: docRef.id });
    
    return {
      id: docRef.id,
      ...fileRecord,
      storageRef: downloadURL // Use download URL for client use
    } as FileRecord;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get files for a course
export const getCourseFiles = async (courseId: string): Promise<FileRecord[]> => {
  try {
    const filesQuery = query(
      collection(db, COLLECTIONS.FILES),
      where("courseId", "==", courseId),
      orderBy("uploadDate", "desc")
    );
    
    const filesSnapshot = await getDocs(filesQuery);
    const files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FileRecord);
    
    // Convert storageRef to download URL if needed
    for (const file of files) {
      if (!file.storageRef.startsWith('http')) {
        try {
          file.storageRef = await getDownloadURL(ref(storage, file.storageRef));
        } catch (err) {
          console.warn(`Could not get download URL for file ${file.fileName}:`, err);
        }
      }
    }
    
    return files;
  } catch (error) {
    console.error("Error getting course files:", error);
    throw error;
  }
};

// Get files for a student's enrolled courses
export const getStudentFiles = async (studentId: string): Promise<FileRecord[]> => {
  try {
    // Get active enrollments
    const enrollmentsQuery = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("studentId", "==", studentId),
      where("status", "==", "active")
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) return [];
    
    // Get files for each course, process in batches
    const allFiles: FileRecord[] = [];
    
    for (let i = 0; i < courseIds.length; i += 10) {
      const batchCourseIds = courseIds.slice(i, i + 10);
      
      const filesQuery = query(
        collection(db, COLLECTIONS.FILES),
        where("courseId", "in", batchCourseIds),
        where("accessLevel", "in", ["public", "course"]), // Only accessible files
        orderBy("uploadDate", "desc")
      );
      
      const filesSnapshot = await getDocs(filesQuery);
      allFiles.push(...filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FileRecord));
    }
    
    // Convert storageRef to download URL if needed
    for (const file of allFiles) {
      if (!file.storageRef.startsWith('http')) {
        try {
          file.storageRef = await getDownloadURL(ref(storage, file.storageRef));
        } catch (err) {
          console.warn(`Could not get download URL for file ${file.fileName}:`, err);
        }
      }
    }
    
    // Sort all files by date (newest first)
    return allFiles.sort((a, b) => {
      const dateA = a.uploadDate instanceof Date ? a.uploadDate.getTime() : a.uploadDate as number;
      const dateB = b.uploadDate instanceof Date ? b.uploadDate.getTime() : b.uploadDate as number;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting student files:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (fileId: string) => {
  try {
    // Get the file record
    const fileDoc = await getDoc(doc(db, COLLECTIONS.FILES, fileId));
    if (!fileDoc.exists()) {
      throw new Error("File not found");
    }
    
    const fileData = fileDoc.data() as FileRecord;
    
    // Delete from storage
    if (fileData.storageRef && !fileData.storageRef.startsWith('http')) {
      // If storageRef is a path, use it directly
      await deleteObject(ref(storage, fileData.storageRef));
    } else {
      // If storageRef is a URL, extract the path
      const url = new URL(fileData.storageRef);
      const storagePath = url.pathname.split('/o/')[1];
      if (storagePath) {
        // Decode the path from URL format
        const decodedPath = decodeURIComponent(storagePath);
        await deleteObject(ref(storage, decodedPath));
      }
    }
    
    // Delete from Firestore
    await deleteDoc(doc(db, COLLECTIONS.FILES, fileId));
    
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};