
// src/lib/sample-data.ts
// import bcrypt from 'bcrypt'; // Removed bcrypt import
// const saltRounds = 10; // Consistent salt rounds // Removed bcrypt usage

// --- Interfaces ---

export interface Course {
  id: string;
  title: string;
  description: string;
  professorId: string; // ID of the professor teaching the course
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'professor' | 'admin';
    // Represents the securely hashed password
    passwordHash: string; // This will now be a placeholder or plain text for sample data
}

export interface Enrollment {
    id: string; // Added ID for easier state management
    studentId: string;
    courseId: string;
    enrolledDate: Date;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    dueDate: Date;
    description: string;
    maxScore: number; // Added maxScore directly to assignment
}

export interface Grade {
    id: string;
    studentId: string;
    assignmentId: string;
    courseId: string; // Denormalized for easier filtering
    score: number; // e.g., 85
    // maxScore is now on the Assignment interface
    gradedDate: Date;
    feedback?: string;
}

export interface Announcement {
    id: string;
    courseId: string;
    title: string;
    content: string;
    postedDate: Date;
    professorId: string;
}

export interface UploadedFile {
    id: string;
    courseId: string;
    professorId: string;
    fileName: string;
    fileType: string; // e.g., 'application/pdf', 'video/mp4'
    uploadDate: Date;
    url: string; // In a real app, this would be a storage URL. For demo, can be placeholder or external link.
    sizeKB: number;
}

// --- Mock Database (Simulated Persistence for Server Instance Lifetime) ---
// In a real app, this would be replaced by actual database interactions.
// This map simulates a user table keyed by lowercase email.
export const mockUsersDb = new Map<string, User>();
// --------------------------------------------------------------------

// --- Initial Sample Data Arrays ---
// These arrays hold the initial state and are MUTATED by simulated add/delete operations
// during the demo session to provide a semblance of persistence across components.
// This is NOT how you would manage data in a real production app (use a DB + API).

// Use bcrypt.hashSync for initial hashing (ONLY for seeding, never on client/request)
const hashPasswordSync = (plainPassword: string): string => {
    // Avoid hashing excessively long passwords during seeding
    // const effectivePassword = plainPassword.length > 50 ? plainPassword.substring(0, 50) : plainPassword;
    // try {
    //     return bcrypt.hashSync(effectivePassword, saltRounds);
    // } catch (error) {
    //     console.error("Error hashing password during seeding:", error);
    //     // Return a known invalid hash or handle appropriately
    //     return '$2b$10$invalidhashgeneratedduringseed';
    // }
    return plainPassword; // Storing plain text for sample data, NOT FOR PRODUCTION
};


// Pre-defined IDs for easier linking
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
const course505Id = 'course505'; // New course

const assign1Id = 'assign1';
const assign2Id = 'assign2';
const assign3Id = 'assign3';
const assign4Id = 'assign4';
const assign5Id = 'assign5';
const assign6Id = 'assign6'; // New assignment

export let initialSampleUsersData: Omit<User, 'id'>[] = [
    // Use pre-defined IDs
    { id: student1Id, name: 'Alice Student', email: 'alice@example.com', role: 'student', passwordHash: hashPasswordSync('password123') },
    { id: student2Id, name: 'Bob Learner', email: 'bob@example.com', role: 'student', passwordHash: hashPasswordSync('password123') },
    { id: student3Id, name: 'Charlie Curious', email: 'charlie@example.com', role: 'student', passwordHash: hashPasswordSync('password123') },
    { id: prof1Id, name: 'Dr. Charles Xavier', email: 'prof.x@example.com', role: 'professor', passwordHash: hashPasswordSync('profpass') },
    { id: prof2Id, name: 'Dr. Eleanor Arroway', email: 'dr.e.arroway@example.com', role: 'professor', passwordHash: hashPasswordSync('profpass') },
    { id: admin1Id, name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: hashPasswordSync('adminpass') },
];


// Populate the mock DB
initialSampleUsersData.forEach(userData => {
    // Add the user object directly (it now includes the ID)
    mockUsersDb.set(userData.email.toLowerCase(), userData as User);
});
console.log("Initial mockUsersDb populated:", Array.from(mockUsersDb.keys()));


// Function to get client-safe user list (without password hashes)
export const getInitialSampleUsersForClient = (): Omit<User, 'passwordHash'>[] => {
     // Read directly from the populated mockUsersDb Map
     return Array.from(mockUsersDb.values()).map(({ passwordHash, ...userWithoutHash }) => userWithoutHash);
};


export let initialSampleCourses: Course[] = [
  { id: course101Id, title: 'Introduction to Quantum Physics', description: 'Explore the fundamentals of quantum mechanics and its applications.', professorId: prof1Id },
  { id: course202Id, title: 'Astrobiology and Search for Life', description: 'Investigating the possibility of life beyond Earth.', professorId: prof2Id },
  { id: course303Id, title: 'Advanced Mutant Ethics', description: 'Ethical considerations in a world with mutants.', professorId: prof1Id },
  { id: course404Id, title: 'Signal Processing in SETI', description: 'Techniques for detecting extraterrestrial intelligence signals.', professorId: prof2Id },
  { id: course505Id, title: 'Introduction to Rocket Science', description: 'Basics of propulsion and orbital mechanics.', professorId: prof2Id }, // Prof Arroway's course
];

export let initialSampleEnrollments: Enrollment[] = [
    { id: 'enroll1', studentId: student1Id, courseId: course101Id, enrolledDate: new Date('2024-01-15') },
    { id: 'enroll2', studentId: student1Id, courseId: course303Id, enrolledDate: new Date('2024-01-15') },
    { id: 'enroll3', studentId: student2Id, courseId: course202Id, enrolledDate: new Date('2024-01-20') },
    { id: 'enroll4', studentId: student2Id, courseId: course404Id, enrolledDate: new Date('2024-01-20') },
    { id: 'enroll5', studentId: student3Id, courseId: course101Id, enrolledDate: new Date('2024-02-01') },
    // Alice also enrolls in Rocket Science
    { id: 'enroll6', studentId: student1Id, courseId: course505Id, enrolledDate: new Date('2024-02-10') },
];

export let initialSampleAssignments: Assignment[] = [
    { id: assign1Id, courseId: course101Id, title: 'Problem Set 1: Wave-Particle Duality', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), description: 'Solve problems related to the De Broglie wavelength and the uncertainty principle.', maxScore: 100 },
    { id: assign2Id, courseId: course101Id, title: 'Problem Set 2: Schrödinger Equation', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), description: 'Apply the time-independent Schrödinger equation to simple potentials.', maxScore: 100 },
    { id: assign3Id, courseId: course202Id, title: 'Research Paper: Extremophiles', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), description: 'Write a 5-page paper on life in extreme environments and its implications for astrobiology.', maxScore: 100 },
    { id: assign4Id, courseId: course303Id, title: 'Essay: Mutant Registration Act', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), description: 'Discuss the ethical pros and cons of a mandatory registration for mutants.', maxScore: 50 },
    { id: assign5Id, courseId: course404Id, title: 'Lab Report: Signal Noise Reduction', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), description: 'Analyze simulated SETI data and apply noise reduction techniques.', maxScore: 100 },
    { id: assign6Id, courseId: course505Id, title: 'Quiz 1: Newton's Laws', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), description: 'Short quiz on Newton's laws of motion.', maxScore: 20 }, // Assignment for new course
];

export let initialSampleGrades: Grade[] = [
    // Use maxScore from assignment
    { id: 'grade1', studentId: student1Id, assignmentId: assign1Id, courseId: course101Id, score: 90, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Excellent work on the duality calculations.' },
    { id: 'grade3', studentId: student3Id, assignmentId: assign1Id, courseId: course101Id, score: 82, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Good effort, review the uncertainty principle application.' },
    { id: 'grade4', studentId: student2Id, assignmentId: assign3Id, courseId: course202Id, score: 95, gradedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), feedback: 'Well-researched paper with strong arguments.' },
    { id: 'grade5', studentId: student1Id, assignmentId: assign4Id, courseId: course303Id, score: 35, gradedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), feedback: 'Arguments need more support, but structure is good.' },
    // Grade for Alice in Rocket Science
    { id: 'grade6', studentId: student1Id, assignmentId: assign6Id, courseId: course505Id, score: 18, gradedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000) },
];

export let initialSampleAnnouncements: Announcement[] = [
    { id: 'ann1', courseId: course101Id, title: 'Welcome to Quantum Physics!', content: 'Welcome everyone! Please review the syllabus and the first reading assignment.', postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), professorId: prof1Id },
    { id: 'ann2', courseId: course101Id, title: 'Office Hours Update', content: 'My office hours for this week will be moved to Wednesday 2-3 PM.', postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), professorId: prof1Id },
    { id: 'ann3', courseId: course202Id, title: 'Guest Lecture Next Week', content: 'We will have a guest lecture from Dr. Jill Tarter on the SETI project next Tuesday.', postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), professorId: prof2Id },
    { id: 'ann4', courseId: course505Id, title: 'First Quiz Reminder', content: 'Don't forget the first quiz on Newton's Laws is due soon!', postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), professorId: prof2Id }, // Announcement for new course
];

export let initialSampleUploadedFiles: UploadedFile[] = [
    { id: 'file1', courseId: course101Id, professorId: prof1Id, fileName: 'Syllabus_QuantumPhysics.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 150 },
    { id: 'file2', courseId: course101Id, professorId: prof1Id, fileName: 'Lecture1_Intro.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 512 },
    { id: 'file3', courseId: course202Id, professorId: prof2Id, fileName: 'Astrobiology_ReadingList.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 80 },
    { id: 'file4', courseId: course303Id, professorId: prof1Id, fileName: 'MutantEthics_CaseStudies.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 45 },
    { id: 'file5', courseId: course101Id, professorId: prof1Id, fileName: 'Intro_To_Quantum_Video.mp4', fileType: 'video/mp4', uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 25600 }, // Example video
    { id: 'file6', courseId: course202Id, professorId: prof2Id, fileName: 'Lecture_DrakeEquation.mp4', fileType: 'video/mp4', uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 31500 }, // Another video
    { id: 'file7', courseId: course505Id, professorId: prof2Id, fileName: 'Rocket_Engine_Types.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 850 }, // File for new course
];


// --- Helper Functions (Read-Only from Initial Data Arrays) ---
// These functions read from the MUTABLE arrays above.

// Get courses taught by a specific professor
export const getCoursesByProfessor = (professorId: string): Course[] => {
    return initialSampleCourses.filter(course => course.professorId === professorId);
};

// Get students enrolled in a specific course
export const getStudentsInCourse = (courseId: string): Omit<User, 'passwordHash'>[] => {
    const studentIds = initialSampleEnrollments
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId);
    const studentsWithHashes = Array.from(mockUsersDb.values()) // Read from mock DB
                                   .filter(user => user.role === 'student' && studentIds.includes(user.id));
    // Remove hash before returning
    return studentsWithHashes.map(({ passwordHash, ...userWithoutHash }) => userWithoutHash);
};


// Get courses a student is enrolled in
export const getCoursesByStudent = (studentId: string): Course[] => {
    const courseIds = initialSampleEnrollments
        .filter(enrollment => enrollment.studentId === studentId)
        .map(enrollment => enrollment.courseId);
    return initialSampleCourses.filter(course => courseIds.includes(course.id));
};

// Get assignments for a specific course
export const getAssignmentsByCourse = (courseId: string): Assignment[] => {
    return initialSampleAssignments.filter(assignment => assignment.courseId === courseId);
}

// Get upcoming assignments for a specific student
export const getUpcomingAssignmentsForStudent = (studentId: string, daysAhead: number = 14): Assignment[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return initialSampleAssignments.filter(assignment =>
        enrolledCourseIds.includes(assignment.courseId) &&
        assignment.dueDate > now &&
        assignment.dueDate <= cutoffDate
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Get grades for a specific student
export const getGradesForStudent = (studentId: string): Grade[] => {
    return initialSampleGrades.filter(grade => grade.studentId === studentId);
}

// Get announcements for courses a student is enrolled in
export const getAnnouncementsForStudent = (studentId: string, limit?: number): Announcement[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    const announcements = initialSampleAnnouncements
        .filter(ann => enrolledCourseIds.includes(ann.courseId))
        .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
    return limit ? announcements.slice(0, limit) : announcements;
};

// Get files for courses a student is enrolled in
export const getFilesForStudent = (studentId: string): UploadedFile[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    return initialSampleUploadedFiles
        .filter(file => enrolledCourseIds.includes(file.courseId))
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
};

// --- Functions to SIMULATE adding/deleting data (for component logic demonstration) ---
// These functions MUTATE the exported 'let' arrays directly for the demo session.
// This is NOT how you'd do it in production.

// Simulate creating a new user object (used by admin dashboard)
// Requires a plain text password to hash *only for the mock DB*.
export const createSampleUser = (userData: Omit<User, 'id' | 'passwordHash'> & { passwordPlain: string }): User => {
    const hash = hashPasswordSync(userData.passwordPlain);
    const newUser: User = {
        id: `${userData.role}-${userData.name.split(' ')[0].toLowerCase()}-${Date.now().toString().slice(-4)}`,
        name: userData.name,
        email: userData.email.toLowerCase(), // Store email lowercase
        role: userData.role,
        passwordHash: hash,
    };
    // Add to mock DB Map
    mockUsersDb.set(newUser.email, newUser);
    console.log(`User ${newUser.email} added to mock DB.`);
    return newUser;
};


// Simulate creating a new course object
export const createSampleCourse = (courseData: Omit<Course, 'id'>): Course | { error: string } => {
    if (initialSampleCourses.some(c => c.title.toLowerCase() === courseData.title.toLowerCase())) {
        return { error: `Course with title "${courseData.title}" already exists.` };
    }
    const newCourse = {
        ...courseData,
        id: `course${Date.now()}`,
    };
    initialSampleCourses.push(newCourse); // Mutate for demo
    console.log(`Course "${newCourse.title}" added to demo data.`);
    return newCourse;
}

// Simulate creating a new announcement object
export const createSampleAnnouncement = (announcement: Omit<Announcement, 'id' | 'postedDate'>): Announcement => {
    const newAnnouncement = {
        ...announcement,
        id: `ann${Date.now()}`, // Use timestamp for uniqueness in demo
        postedDate: new Date(),
    };
    initialSampleAnnouncements.push(newAnnouncement); // Mutate for demo
    console.log(`Announcement "${newAnnouncement.title}" added to demo data.`);
    return newAnnouncement;
}

// Simulate creating a new file upload object
export const createSampleFile = (fileData: Omit<UploadedFile, 'id' | 'uploadDate'>): UploadedFile => {
    const newFile = {
        ...fileData,
        id: `file${Date.now()}`, // Use timestamp for uniqueness in demo
        uploadDate: new Date(),
        // IMPORTANT: Replace '#' with actual URL in real app
        // For demo, maybe use a placeholder image/document link if needed
        url: fileData.url || '#'
    };
    initialSampleUploadedFiles.push(newFile); // Mutate for demo
    console.log(`File "${newFile.fileName}" added to demo data.`);
    return newFile;
};

// Simulate creating a new enrollment object
export const createSampleEnrollment = (studentId: string, courseId: string): Enrollment => {
     const newEnrollment = {
        id: `enroll${Date.now()}`,
        studentId: studentId,
        courseId: courseId,
        enrolledDate: new Date(),
    };
    initialSampleEnrollments.push(newEnrollment); // Mutate for demo
    console.log(`Enrollment for student ${studentId} in course ${courseId} added to demo data.`);
    return newEnrollment;
};

// --- Functions to SIMULATE Deleting Data ---

export const deleteSampleUser = (userId: string): boolean => {
    const userToDelete = Array.from(mockUsersDb.values()).find(u => u.id === userId);
    if (!userToDelete) return false;

    const emailKey = userToDelete.email.toLowerCase();
    const deletedFromDb = mockUsersDb.delete(emailKey);

    if (deletedFromDb) {
        // Also remove associated enrollments, grades, etc., from the mutable arrays
        initialSampleEnrollments = initialSampleEnrollments.filter(e => e.studentId !== userId);
        initialSampleGrades = initialSampleGrades.filter(g => g.studentId !== userId);
        // If professor, handle courses, announcements, files (maybe mark as unassigned)
        if (userToDelete.role === 'professor') {
             initialSampleCourses = initialSampleCourses.map(c => c.professorId === userId ? { ...c, professorId: 'unassigned' } : c);
             initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.professorId !== userId);
             initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.professorId !== userId);
        }
        console.log(`User ${emailKey} and associated data removed from demo data.`);
        return true;
    }
    return false;
};

export const deleteSampleCourse = (courseId: string): boolean => {
    const initialLength = initialSampleCourses.length;
    initialSampleCourses = initialSampleCourses.filter(c => c.id !== courseId);
    if (initialSampleCourses.length < initialLength) {
        // Cascade delete related data
        initialSampleEnrollments = initialSampleEnrollments.filter(e => e.courseId !== courseId);
        initialSampleAssignments = initialSampleAssignments.filter(a => a.courseId !== courseId);
        initialSampleGrades = initialSampleGrades.filter(g => g.courseId !== courseId);
        initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.courseId !== courseId);
        initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.courseId !== courseId);
        console.log(`Course ${courseId} and associated data removed from demo data.`);
        return true;
    }
    return false;
};

export const deleteSampleFile = (fileId: string): boolean => {
    const initialLength = initialSampleUploadedFiles.length;
    initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.id !== fileId);
    if (initialSampleUploadedFiles.length < initialLength) {
        console.log(`File ${fileId} removed from demo data.`);
        // In a real app, also delete from storage
        return true;
    }
    return false;
};

export const deleteSampleAnnouncement = (announcementId: string): boolean => {
    const initialLength = initialSampleAnnouncements.length;
    initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.id !== announcementId);
     if (initialSampleAnnouncements.length < initialLength) {
        console.log(`Announcement ${announcementId} removed from demo data.`);
        return true;
    }
    return false;
};
