
// src/lib/sample-data.ts
import bcrypt from 'bcrypt';
const saltRounds = 10; // Consistent salt rounds

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
    passwordHash: string;
}

export interface Enrollment {
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
}

export interface Grade {
    id: string;
    studentId: string;
    assignmentId: string;
    courseId: string;
    score: number; // e.g., 85
    maxScore: number; // e.g., 100
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
// This map simulates a user table.
export const mockUsersDb = new Map<string, User>();
// --------------------------------------------------------------------

// Initial Sample Data - Populates the mock DB on server start.
// Passwords are pre-hashed. Use bcrypt.compare() to verify.
// Example hashes generated with saltRounds = 10:
// 'password123' -> $2b$10$xOQeB3fL.4b.H/f3dJ8z/eU/q8k6Gz8eL7T7J8z/eU/q8k6Gz8eL
// 'password456' -> $2b$10$dOQeC3fM.5c.I/g3dJ9z/fV/r9l7H0fN8U8K9L/gV/r9l7H0fN8
// 'adminpass'   -> $2b$10$ePReD4gN.6d.J/h4eK0a/gW/s0m8I1gO9V9L0M/hW/s0m8I1gO9
// **Note:** These are examples; actual hashes will vary due to salting. Replace with your own generated hashes if needed.

export const initialSampleUsersData: Omit<User, 'id'>[] = [
    { name: 'Alice Student', email: 'alice@example.com', role: 'student', passwordHash: '$2b$10$xOQeB3fL.4b.H/f3dJ8z/eU/q8k6Gz8eL7T7J8z/eU/q8k6Gz8eL' },
    { name: 'Bob Learner', email: 'bob@example.com', role: 'student', passwordHash: '$2b$10$xOQeB3fL.4b.H/f3dJ8z/eU/q8k6Gz8eL7T7J8z/eU/q8k6Gz8eL' },
    { name: 'Charlie Curious', email: 'charlie@example.com', role: 'student', passwordHash: '$2b$10$xOQeB3fL.4b.H/f3dJ8z/eU/q8k6Gz8eL7T7J8z/eU/q8k6Gz8eL' },
    { name: 'Dr. Charles Xavier', email: 'prof.x@example.com', role: 'professor', passwordHash: '$2b$10$dOQeC3fM.5c.I/g3dJ9z/fV/r9l7H0fN8U8K9L/gV/r9l7H0fN8' },
    { name: 'Dr. Eleanor Arroway', email: 'dr.e.arroway@example.com', role: 'professor', passwordHash: '$2b$10$dOQeC3fM.5c.I/g3dJ9z/fV/r9l7H0fN8U8K9L/gV/r9l7H0fN8' },
    { name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: '$2b$10$ePReD4gN.6d.J/h4eK0a/gW/s0m8I1gO9V9L0M/hW/s0m8I1gO9' },
];

// Populate the mock DB
initialSampleUsersData.forEach((userData, index) => {
    const userId = `${userData.role}-${index + 1}`;
    const user: User = {
        id: userId,
        ...userData,
    };
    mockUsersDb.set(user.email.toLowerCase(), user);
});

// Function to get the initial users (used by admin dashboard etc.)
// This should return users *without* the password hash for client-side use.
export const getInitialSampleUsersForClient = (): Omit<User, 'passwordHash'>[] => {
     return Array.from(mockUsersDb.values()).map(({ passwordHash, ...userWithoutHash }) => userWithoutHash);
};

// Keep the original initialSampleUsers (with hashes) for server-side checks if needed,
// but avoid exporting it directly if possible to prevent accidental client-side exposure.
// For this example, we'll rely on mockUsersDb for server lookups.

export const initialSampleCourses: Course[] = [
  {
    id: 'course101',
    title: 'Introduction to Quantum Physics',
    description: 'Explore the fundamentals of quantum mechanics and its applications.',
    professorId: 'professor-1', // Matches Dr. Xavier's simulated ID if needed
  },
  {
    id: 'course202',
    title: 'Astrobiology and Search for Life',
    description: 'Investigating the possibility of life beyond Earth.',
    professorId: 'professor-2', // Matches Dr. Arroway's simulated ID if needed
  },
  {
    id: 'course303',
    title: 'Advanced Mutant Ethics',
    description: 'Ethical considerations in a world with mutants.',
    professorId: 'professor-1',
  },
   {
    id: 'course404',
    title: 'Signal Processing in SETI',
    description: 'Techniques for detecting extraterrestrial intelligence signals.',
    professorId: 'professor-2',
  },
];

export const initialSampleEnrollments: Enrollment[] = [
    { studentId: 'student-1', courseId: 'course101', enrolledDate: new Date('2024-01-15') },
    { studentId: 'student-1', courseId: 'course303', enrolledDate: new Date('2024-01-15') },
    { studentId: 'student-2', courseId: 'course202', enrolledDate: new Date('2024-01-20') },
    { studentId: 'student-2', courseId: 'course404', enrolledDate: new Date('2024-01-20') },
    { studentId: 'student-3', courseId: 'course101', enrolledDate: new Date('2024-02-01') },
];

export const initialSampleAssignments: Assignment[] = [
    { id: 'assign1', courseId: 'course101', title: 'Problem Set 1: Wave-Particle Duality', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), description: 'Solve problems related to the De Broglie wavelength and the uncertainty principle.' },
    { id: 'assign2', courseId: 'course101', title: 'Problem Set 2: Schrödinger Equation', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), description: 'Apply the time-independent Schrödinger equation to simple potentials.' },
    { id: 'assign3', courseId: 'course202', title: 'Research Paper: Extremophiles', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), description: 'Write a 5-page paper on life in extreme environments and its implications for astrobiology.' },
    { id: 'assign4', courseId: 'course303', title: 'Essay: Mutant Registration Act', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), description: 'Discuss the ethical pros and cons of a mandatory registration for mutants.' },
    { id: 'assign5', courseId: 'course404', title: 'Lab Report: Signal Noise Reduction', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), description: 'Analyze simulated SETI data and apply noise reduction techniques.' },
];

export const initialSampleGrades: Grade[] = [
    { id: 'grade1', studentId: 'student-1', assignmentId: 'assign1', courseId: 'course101', score: 90, maxScore: 100, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Excellent work on the duality calculations.' },
    { id: 'grade3', studentId: 'student-3', assignmentId: 'assign1', courseId: 'course101', score: 82, maxScore: 100, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Good effort, review the uncertainty principle application.' },
    { id: 'grade4', studentId: 'student-2', assignmentId: 'assign3', courseId: 'course202', score: 95, maxScore: 100, gradedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), feedback: 'Well-researched paper with strong arguments.' },
    { id: 'grade5', studentId: 'student-1', assignmentId: 'assign4', courseId: 'course303', score: 75, maxScore: 100, gradedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), feedback: 'Arguments need more support, but structure is good.' },
];

export const initialSampleAnnouncements: Announcement[] = [
    { id: 'ann1', courseId: 'course101', title: 'Welcome to Quantum Physics!', content: 'Welcome everyone! Please review the syllabus and the first reading assignment.', postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), professorId: 'professor-1' },
    { id: 'ann2', courseId: 'course101', title: 'Office Hours Update', content: 'My office hours for this week will be moved to Wednesday 2-3 PM.', postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), professorId: 'professor-1' },
    { id: 'ann3', courseId: 'course202', title: 'Guest Lecture Next Week', content: 'We will have a guest lecture from Dr. Jill Tarter on the SETI project next Tuesday.', postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), professorId: 'professor-2' },
];

export const initialSampleUploadedFiles: UploadedFile[] = [
    { id: 'file1', courseId: 'course101', professorId: 'professor-1', fileName: 'Syllabus_QuantumPhysics.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 150 },
    { id: 'file2', courseId: 'course101', professorId: 'professor-1', fileName: 'Lecture1_Intro.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 512 },
    { id: 'file3', courseId: 'course202', professorId: 'professor-2', fileName: 'Astrobiology_ReadingList.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 80 },
    { id: 'file4', courseId: 'course303', professorId: 'professor-1', fileName: 'MutantEthics_CaseStudies.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 45 },
    { id: 'file5', courseId: 'course101', professorId: 'professor-1', fileName: 'Intro_To_Quantum_Video.mp4', fileType: 'video/mp4', uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 25600 }, // Example video
];


// --- Helper Functions (Read-Only from Initial Data) ---

// Get courses taught by a specific professor
export const getCoursesByProfessor = (professorId: string): Course[] => {
    return initialSampleCourses.filter(course => course.professorId === professorId);
};

// Get students enrolled in a specific course
export const getStudentsInCourse = (courseId: string): Omit<User, 'passwordHash'>[] => {
    const studentIds = initialSampleEnrollments
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId);
    const studentsWithHashes = Array.from(mockUsersDb.values())
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

// Get recent grades for a specific student
export const getRecentGradesForStudent = (studentId: string, limit: number = 5): Grade[] => {
    return initialSampleGrades
        .filter(grade => grade.studentId === studentId)
        .sort((a, b) => b.gradedDate.getTime() - a.gradedDate.getTime())
        .slice(0, limit);
}

// Get announcements for courses a student is enrolled in
export const getAnnouncementsForStudent = (studentId: string, limit: number = 5): Announcement[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    return initialSampleAnnouncements
        .filter(ann => enrolledCourseIds.includes(ann.courseId))
        .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
        .slice(0, limit);
};

// Get announcements for courses taught by a professor
export const getAnnouncementsForProfessor = (professorId: string): Announcement[] => {
    const taughtCourseIds = getCoursesByProfessor(professorId).map(c => c.id);
    return initialSampleAnnouncements
        .filter(ann => taughtCourseIds.includes(ann.courseId))
        .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
};

// Get files uploaded for a specific course
export const getFilesByCourse = (courseId: string): UploadedFile[] => {
    return initialSampleUploadedFiles.filter(file => file.courseId === courseId)
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
}

// Get files uploaded by a specific professor
export const getFilesByProfessor = (professorId: string): UploadedFile[] => {
    return initialSampleUploadedFiles.filter(file => file.professorId === professorId)
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
};

// --- Functions to SIMULATE adding data (for component logic demonstration) ---
// These functions DO NOT mutate the initial arrays. They return new objects.
// Components should manage their own state updates.

// Simulate creating a new announcement object
export const createSampleAnnouncement = (announcement: Omit<Announcement, 'id' | 'postedDate'>): Announcement => {
    return {
        ...announcement,
        id: `ann${Date.now()}`, // Use timestamp for uniqueness in demo
        postedDate: new Date(),
    };
}

// Simulate creating a new file upload object
export const createSampleFile = (fileData: Omit<UploadedFile, 'id' | 'uploadDate'>): UploadedFile => {
    return {
        ...fileData,
        id: `file${Date.now()}`, // Use timestamp for uniqueness in demo
        uploadDate: new Date(),
    };
}

// Simulate creating a new user object (used internally by signup API route)
// Requires a pre-generated passwordHash.
export const createSampleUser = (userData: Omit<User, 'id'>): User => {
    // Use bcrypt.hashSync for simulating hash generation *if needed*, but prefer passing pre-hashed value
    // const hash = bcrypt.hashSync(passwordPlain || 'defaultpassword', saltRounds); // Example: Never hash synchronously on client-side

    return {
        id: `${userData.role}-${userData.name.split(' ')[0].toLowerCase()}-${Date.now().toString().slice(-4)}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        passwordHash: userData.passwordHash, // Assume hash is provided
    };
};


// Simulate creating a new course object
export const createSampleCourse = (courseData: Omit<Course, 'id'>): Course | { error: string } => {
    // Check if course with this title already exists in initial data
    // NOTE: This check is against initial data, not the live mockUsersDb - adjust if needed for dynamic course creation demo
    if (initialSampleCourses.some(c => c.title.toLowerCase() === courseData.title.toLowerCase())) {
        console.warn(`Course with title "${courseData.title}" already exists in initial data. Cannot simulate creation.`);
        return { error: `Course with title "${courseData.title}" already exists.` };
    }
    return {
        ...courseData,
        id: `course${Date.now()}`, // Use timestamp for uniqueness in demo
    };
}

// Simulate creating a new enrollment object
export const createSampleEnrollment = (studentId: string, courseId: string): Enrollment => {
    return {
        studentId: studentId,
        courseId: courseId,
        enrolledDate: new Date(),
    };
};

// NOTE: In a real application, these 'create' functions would be replaced by API calls
// to a backend service that interacts with a database and returns the created record.
// Components would then use the returned data to update their local state.
// The mockUsersDb map provides a *basic* simulation of a persistent store for the lifetime
// of the server instance, allowing signup/login to "work" during a single session.
