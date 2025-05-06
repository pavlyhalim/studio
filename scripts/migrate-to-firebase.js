/**
 * Migration script to import sample data into Firebase
 * 
 * Run this script with Node.js:
 * node scripts/migrate-to-firebase.js
 * 
 * Make sure your .env.local file is properly configured with Firebase credentials
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
} catch (error) {
  console.error('Error parsing Firebase service account JSON:', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const auth = admin.auth();

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  ENROLLMENTS: 'enrollments',
  ASSIGNMENTS: 'assignments',
  GRADES: 'grades',
  ANNOUNCEMENTS: 'announcements',
  FILES: 'files',
};

// Sample data (copied from your mock data structure)
// Use the same IDs as in the mock data to ensure consistency
const student1Id = 'student-1';
const student2Id = 'student-2';
const student3Id = 'student-3';
const prof1Id = 'professor-1';
const prof2Id = 'professor-2';
const admin1Id = 'admin-1';

const course101Id = 'course101';
const course202Id = 'course202';
const course303Id = 'course303';
const course404Id = 'course404';
const course505Id = 'course505';

const assign1Id = 'assign1';
const assign2Id = 'assign2';
const assign3Id = 'assign3';
const assign4Id = 'assign4';
const assign5Id = 'assign5';
const assign6Id = 'assign6';

// Create a batch to perform multiple operations atomically
let batch = db.batch();
let batchCount = 0;
const BATCH_LIMIT = 400; // Firestore batch limit is 500, use 400 to be safe

// Function to commit the current batch and create a new one
async function commitBatch() {
  await batch.commit();
  console.log(`Committed batch with ${batchCount} operations`);
  batch = db.batch();
  batchCount = 0;
}

// Helper function to add document to batch
function addToBatch(collection, id, data) {
  const docRef = db.collection(collection).doc(id);
  batch.set(docRef, data);
  batchCount++;
  
  if (batchCount >= BATCH_LIMIT) {
    commitBatch();
  }
}

// Helper function to convert Date to Firestore Timestamp
function dateToTimestamp(date) {
  return admin.firestore.Timestamp.fromDate(date);
}

// Main migration function
async function migrateData() {
  try {
    console.log('Starting migration to Firebase...');
    
    // 1. Migrate Users
    console.log('Migrating users...');
    
    const users = [
      { id: student1Id, name: 'Alice Student', email: 'alice@example.com', role: 'student', password: 'password123' },
      { id: student2Id, name: 'Bob Learner', email: 'bob@example.com', role: 'student', password: 'password123' },
      { id: student3Id, name: 'Charlie Curious', email: 'charlie@example.com', role: 'student', password: 'password123' },
      { id: prof1Id, name: 'Dr. Charles Xavier', email: 'prof.x@example.com', role: 'professor', password: 'profpass' },
      { id: prof2Id, name: 'Dr. Eleanor Arroway', email: 'dr.e.arroway@example.com', role: 'professor', password: 'profpass' },
      { id: admin1Id, name: 'Admin User', email: 'admin@example.com', role: 'admin', password: 'adminpass' },
    ];
    
    // Create users in Auth
    for (const user of users) {
      try {
        // Check if user already exists
        try {
          await auth.getUser(user.id);
          console.log(`User ${user.email} already exists, skipping creation`);
          continue;
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
        }
        
        // Create user in Auth
        await auth.createUser({
          uid: user.id,
          email: user.email,
          password: user.password,
          displayName: user.name,
          emailVerified: true,
        });
        
        console.log(`Created user in Auth: ${user.email}`);
        
        // Add user document to Firestore
        addToBatch(COLLECTIONS.USERS, user.id, {
          id: user.id,
          name: user.name,
          email: user.email.toLowerCase(),
          role: user.role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    // 2. Migrate Courses
    console.log('Migrating courses...');
    
    const courses = [
      { id: course101Id, title: 'Introduction to Quantum Physics', description: 'Explore the fundamentals of quantum mechanics and its applications.', professorId: prof1Id },
      { id: course202Id, title: 'Astrobiology and Search for Life', description: 'Investigating the possibility of life beyond Earth.', professorId: prof2Id },
      { id: course303Id, title: 'Advanced Mutant Ethics', description: 'Ethical considerations in a world with mutants.', professorId: prof1Id },
      { id: course404Id, title: 'Signal Processing in SETI', description: 'Techniques for detecting extraterrestrial intelligence signals.', professorId: prof2Id },
      { id: course505Id, title: 'Introduction to Rocket Science', description: 'Basics of propulsion and orbital mechanics.', professorId: prof2Id },
    ];
    
    for (const course of courses) {
      addToBatch(COLLECTIONS.COURSES, course.id, {
        ...course,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
      });
    }
    
    // 3. Migrate Enrollments
    console.log('Migrating enrollments...');
    
    const enrollments = [
      { id: 'enroll1', studentId: student1Id, courseId: course101Id, enrolledDate: new Date('2024-01-15') },
      { id: 'enroll2', studentId: student1Id, courseId: course303Id, enrolledDate: new Date('2024-01-15') },
      { id: 'enroll3', studentId: student2Id, courseId: course202Id, enrolledDate: new Date('2024-01-20') },
      { id: 'enroll4', studentId: student2Id, courseId: course404Id, enrolledDate: new Date('2024-01-20') },
      { id: 'enroll5', studentId: student3Id, courseId: course101Id, enrolledDate: new Date('2024-02-01') },
      { id: 'enroll6', studentId: student1Id, courseId: course505Id, enrolledDate: new Date('2024-02-10') },
    ];
    
    for (const enrollment of enrollments) {
      addToBatch(COLLECTIONS.ENROLLMENTS, enrollment.id, {
        ...enrollment,
        enrolledDate: dateToTimestamp(enrollment.enrolledDate),
        status: 'active',
      });
    }
    
    // 4. Migrate Assignments
    console.log('Migrating assignments...');
    
    const now = new Date();
    
    const assignments = [
      { id: assign1Id, courseId: course101Id, title: 'Problem Set 1: Wave-Particle Duality', dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), description: 'Solve problems related to the De Broglie wavelength and the uncertainty principle.', maxScore: 100, type: 'problem_set' },
      { id: assign2Id, courseId: course101Id, title: 'Problem Set 2: Schrödinger Equation', dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), description: 'Apply the time-independent Schrödinger equation to simple potentials.', maxScore: 100, type: 'problem_set' },
      { id: assign3Id, courseId: course202Id, title: 'Research Paper: Extremophiles', dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), description: 'Write a 5-page paper on life in extreme environments and its implications for astrobiology.', maxScore: 100, type: 'essay' },
      { id: assign4Id, courseId: course303Id, title: 'Essay: Mutant Registration Act', dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), description: 'Discuss the ethical pros and cons of a mandatory registration for mutants.', maxScore: 50, type: 'essay' },
      { id: assign5Id, courseId: course404Id, title: 'Lab Report: Signal Noise Reduction', dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), description: 'Analyze simulated SETI data and apply noise reduction techniques.', maxScore: 100, type: 'project' },
      { id: assign6Id, courseId: course505Id, title: 'Quiz 1: Newton\'s Laws', dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), description: 'Short quiz on Newton\'s laws of motion.', maxScore: 20, type: 'quiz' },
    ];
    
    for (const assignment of assignments) {
      addToBatch(COLLECTIONS.ASSIGNMENTS, assignment.id, {
        ...assignment,
        dueDate: dateToTimestamp(assignment.dueDate),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // 5. Migrate Grades
    console.log('Migrating grades...');
    
    const grades = [
      { id: 'grade1', studentId: student1Id, assignmentId: assign1Id, courseId: course101Id, score: 90, gradedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), feedback: 'Excellent work on the duality calculations.', graderId: prof1Id },
      { id: 'grade3', studentId: student3Id, assignmentId: assign1Id, courseId: course101Id, score: 82, gradedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), feedback: 'Good effort, review the uncertainty principle application.', graderId: prof1Id },
      { id: 'grade4', studentId: student2Id, assignmentId: assign3Id, courseId: course202Id, score: 95, gradedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), feedback: 'Well-researched paper with strong arguments.', graderId: prof2Id },
      { id: 'grade5', studentId: student1Id, assignmentId: assign4Id, courseId: course303Id, score: 35, gradedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), feedback: 'Arguments need more support, but structure is good.', graderId: prof1Id },
      { id: 'grade6', studentId: student1Id, assignmentId: assign6Id, courseId: course505Id, score: 18, gradedDate: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000), graderId: prof2Id },
    ];
    
    for (const grade of grades) {
      addToBatch(COLLECTIONS.GRADES, grade.id, {
        ...grade,
        gradedDate: dateToTimestamp(grade.gradedDate),
      });
    }
    
    // 6. Migrate Announcements
    console.log('Migrating announcements...');
    
    const announcements = [
      { id: 'ann1', courseId: course101Id, title: 'Welcome to Quantum Physics!', content: 'Welcome everyone! Please review the syllabus and the first reading assignment.', postedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), professorId: prof1Id },
      { id: 'ann2', courseId: course101Id, title: 'Office Hours Update', content: 'My office hours for this week will be moved to Wednesday 2-3 PM.', postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), professorId: prof1Id },
      { id: 'ann3', courseId: course202Id, title: 'Guest Lecture Next Week', content: 'We will have a guest lecture from Dr. Jill Tarter on the SETI project next Tuesday.', postedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), professorId: prof2Id },
      { id: 'ann4', courseId: course505Id, title: 'First Quiz Reminder', content: 'Don\'t forget the first quiz on Newton\'s Laws is due soon!', postedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), professorId: prof2Id },
    ];
    
    for (const announcement of announcements) {
      addToBatch(COLLECTIONS.ANNOUNCEMENTS, announcement.id, {
        ...announcement,
        postedDate: dateToTimestamp(announcement.postedDate),
      });
    }
    
    // 7. Migrate Files (without actual file content)
    console.log('Migrating file metadata (without actual files)...');
    
    const files = [
      { id: 'file1', courseId: course101Id, professorId: prof1Id, fileName: 'Syllabus_QuantumPhysics.pdf', fileType: 'application/pdf', uploadDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), storageRef: `courses/${course101Id}/files/Syllabus_QuantumPhysics.pdf`, sizeKB: 150, accessLevel: 'course' },
      { id: 'file2', courseId: course101Id, professorId: prof1Id, fileName: 'Lecture1_Intro.pdf', fileType: 'application/pdf', uploadDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), storageRef: `courses/${course101Id}/files/Lecture1_Intro.pdf`, sizeKB: 512, accessLevel: 'course' },
      { id: 'file3', courseId: course202Id, professorId: prof2Id, fileName: 'Astrobiology_ReadingList.pdf', fileType: 'application/pdf', uploadDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), storageRef: `courses/${course202Id}/files/Astrobiology_ReadingList.pdf`, sizeKB: 80, accessLevel: 'course' },
      { id: 'file4', courseId: course303Id, professorId: prof1Id, fileName: 'MutantEthics_CaseStudies.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), storageRef: `courses/${course303Id}/files/MutantEthics_CaseStudies.docx`, sizeKB: 45, accessLevel: 'course' },
      { id: 'file5', courseId: course101Id, professorId: prof1Id, fileName: 'Intro_To_Quantum_Video.mp4', fileType: 'video/mp4', uploadDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), storageRef: `courses/${course101Id}/files/Intro_To_Quantum_Video.mp4`, sizeKB: 25600, accessLevel: 'public' },
      { id: 'file6', courseId: course202Id, professorId: prof2Id, fileName: 'Lecture_DrakeEquation.mp4', fileType: 'video/mp4', uploadDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), storageRef: `courses/${course202Id}/files/Lecture_DrakeEquation.mp4`, sizeKB: 31500, accessLevel: 'public' },
      { id: 'file7', courseId: course505Id, professorId: prof2Id, fileName: 'Rocket_Engine_Types.pdf', fileType: 'application/pdf', uploadDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), storageRef: `courses/${course505Id}/files/Rocket_Engine_Types.pdf`, sizeKB: 850, accessLevel: 'course' },
    ];
    
    for (const file of files) {
      addToBatch(COLLECTIONS.FILES, file.id, {
        ...file,
        uploadDate: dateToTimestamp(file.uploadDate),
      });
    }
    
    // Commit any remaining operations
    if (batchCount > 0) {
      await commitBatch();
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData().then(() => {
  console.log('Migration script completed');
  process.exit(0);
}).catch(error => {
  console.error('Error in migration script:', error);
  process.exit(1);
});