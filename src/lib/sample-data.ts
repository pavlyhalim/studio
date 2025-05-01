
// src/lib/sample-data.ts

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

// Sample Users
export const sampleUsers: User[] = [
    { id: 'student1', name: 'Alice Student', email: 'alice@example.com', role: 'student' },
    { id: 'student2', name: 'Bob Learner', email: 'bob@example.com', role: 'student' },
    { id: 'student3', name: 'Charlie Curious', email: 'charlie@example.com', role: 'student' },
    { id: 'prof1', name: 'Dr. Charles Xavier', email: 'prof.x@example.com', role: 'professor' },
    { id: 'prof2', name: 'Dr. Eleanor Arroway', email: 'dr.e.arroway@example.com', role: 'professor' },
    { id: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

// Sample Courses
export const sampleCourses: Course[] = [
  {
    id: 'course101',
    title: 'Introduction to Quantum Physics',
    description: 'Explore the fundamentals of quantum mechanics and its applications.',
    professorId: 'prof1',
  },
  {
    id: 'course202',
    title: 'Astrobiology and Search for Life',
    description: 'Investigating the possibility of life beyond Earth.',
    professorId: 'prof2',
  },
  {
    id: 'course303',
    title: 'Advanced Mutant Ethics',
    description: 'Ethical considerations in a world with mutants.',
    professorId: 'prof1',
  },
   {
    id: 'course404',
    title: 'Signal Processing in SETI',
    description: 'Techniques for detecting extraterrestrial intelligence signals.',
    professorId: 'prof2',
  },
];

// Sample Enrollments
export const sampleEnrollments: Enrollment[] = [
    { studentId: 'student1', courseId: 'course101', enrolledDate: new Date('2024-01-15') },
    { studentId: 'student1', courseId: 'course303', enrolledDate: new Date('2024-01-15') },
    { studentId: 'student2', courseId: 'course202', enrolledDate: new Date('2024-01-20') },
    { studentId: 'student2', courseId: 'course404', enrolledDate: new Date('2024-01-20') },
    { studentId: 'student3', courseId: 'course101', enrolledDate: new Date('2024-02-01') },
];

// Sample Assignments
export const sampleAssignments: Assignment[] = [
    { id: 'assign1', courseId: 'course101', title: 'Problem Set 1: Wave-Particle Duality', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), description: 'Solve problems related to the De Broglie wavelength and the uncertainty principle.' },
    { id: 'assign2', courseId: 'course101', title: 'Problem Set 2: Schrödinger Equation', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), description: 'Apply the time-independent Schrödinger equation to simple potentials.' },
    { id: 'assign3', courseId: 'course202', title: 'Research Paper: Extremophiles', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), description: 'Write a 5-page paper on life in extreme environments and its implications for astrobiology.' },
    { id: 'assign4', courseId: 'course303', title: 'Essay: Mutant Registration Act', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), description: 'Discuss the ethical pros and cons of a mandatory registration for mutants.' },
    { id: 'assign5', courseId: 'course404', title: 'Lab Report: Signal Noise Reduction', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), description: 'Analyze simulated SETI data and apply noise reduction techniques.' },
];

// Sample Grades
export const sampleGrades: Grade[] = [
    { id: 'grade1', studentId: 'student1', assignmentId: 'assign1', courseId: 'course101', score: 90, maxScore: 100, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Excellent work on the duality calculations.' },
    { id: 'grade2', studentId: 'student3', assignmentId: 'assign1', courseId: 'course101', score: 82, maxScore: 100, gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), feedback: 'Good effort, review the uncertainty principle application.' },
    { id: 'grade3', studentId: 'student2', assignmentId: 'assign3', courseId: 'course202', score: 95, maxScore: 100, gradedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), feedback: 'Well-researched paper with strong arguments.' },
];

// Sample Announcements
export const sampleAnnouncements: Announcement[] = [
    { id: 'ann1', courseId: 'course101', title: 'Welcome to Quantum Physics!', content: 'Welcome everyone! Please review the syllabus and the first reading assignment.', postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), professorId: 'prof1' },
    { id: 'ann2', courseId: 'course101', title: 'Office Hours Update', content: 'My office hours for this week will be moved to Wednesday 2-3 PM.', postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), professorId: 'prof1' },
    { id: 'ann3', courseId: 'course202', title: 'Guest Lecture Next Week', content: 'We will have a guest lecture from Dr. Jill Tarter on the SETI project next Tuesday.', postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), professorId: 'prof2' },
];

// Sample Uploaded Files (Simulated)
export const sampleUploadedFiles: UploadedFile[] = [
    { id: 'file1', courseId: 'course101', professorId: 'prof1', fileName: 'Syllabus_QuantumPhysics.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 150 },
    { id: 'file2', courseId: 'course101', professorId: 'prof1', fileName: 'Lecture1_Intro.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 512 },
    { id: 'file3', courseId: 'course202', professorId: 'prof2', fileName: 'Astrobiology_ReadingList.pdf', fileType: 'application/pdf', uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 80 },
    { id: 'file4', courseId: 'course303', professorId: 'prof1', fileName: 'MutantEthics_CaseStudies.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), url: '#', sizeKB: 45 },
    { id: 'file5', courseId: 'course101', professorId: 'prof1', fileName: 'Intro_To_Quantum_Video.mp4', fileType: 'video/mp4', uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), url: 'https://www.youtube.com/embed/ primjer_videa', sizeKB: 25600 }, // Example video
];


// --- Helper Functions ---

// Get courses taught by a specific professor
export const getCoursesByProfessor = (professorId: string): Course[] => {
    return sampleCourses.filter(course => course.professorId === professorId);
};

// Get students enrolled in a specific course
export const getStudentsInCourse = (courseId: string): User[] => {
    const studentIds = sampleEnrollments
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId);
    return sampleUsers.filter(user => user.role === 'student' && studentIds.includes(user.id));
};

// Get courses a student is enrolled in
export const getCoursesByStudent = (studentId: string): Course[] => {
    const courseIds = sampleEnrollments
        .filter(enrollment => enrollment.studentId === studentId)
        .map(enrollment => enrollment.courseId);
    return sampleCourses.filter(course => courseIds.includes(course.id));
};

// Get assignments for a specific course
export const getAssignmentsByCourse = (courseId: string): Assignment[] => {
    return sampleAssignments.filter(assignment => assignment.courseId === courseId);
}

// Get upcoming assignments for a specific student
export const getUpcomingAssignmentsForStudent = (studentId: string, daysAhead: number = 7): Assignment[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    const cutoffDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return sampleAssignments.filter(assignment =>
        enrolledCourseIds.includes(assignment.courseId) &&
        assignment.dueDate > new Date() &&
        assignment.dueDate <= cutoffDate
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Get recent grades for a specific student
export const getRecentGradesForStudent = (studentId: string, limit: number = 5): Grade[] => {
    return sampleGrades
        .filter(grade => grade.studentId === studentId)
        .sort((a, b) => b.gradedDate.getTime() - a.gradedDate.getTime())
        .slice(0, limit);
}

// Get announcements for courses a student is enrolled in
export const getAnnouncementsForStudent = (studentId: string, limit: number = 5): Announcement[] => {
    const enrolledCourseIds = getCoursesByStudent(studentId).map(c => c.id);
    return sampleAnnouncements
        .filter(ann => enrolledCourseIds.includes(ann.courseId))
        .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
        .slice(0, limit);
};

// Get announcements for courses taught by a professor
export const getAnnouncementsForProfessor = (professorId: string, limit: number = 5): Announcement[] => {
    const taughtCourseIds = getCoursesByProfessor(professorId).map(c => c.id);
    return sampleAnnouncements
        .filter(ann => taughtCourseIds.includes(ann.courseId))
        .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
        .slice(0, limit);
};

// Get files uploaded for a specific course
export const getFilesByCourse = (courseId: string): UploadedFile[] => {
    return sampleUploadedFiles.filter(file => file.courseId === courseId);
}

// Get files uploaded by a specific professor
export const getFilesByProfessor = (professorId: string): UploadedFile[] => {
    return sampleUploadedFiles.filter(file => file.professorId === professorId);
};

// Simulate adding a new announcement (local state update only for demo)
export const addSampleAnnouncement = (announcement: Omit<Announcement, 'id' | 'postedDate'>): Announcement => {
    const newAnnouncement: Announcement = {
        ...announcement,
        id: `ann${sampleAnnouncements.length + 1}`,
        postedDate: new Date(),
    };
    sampleAnnouncements.unshift(newAnnouncement); // Add to beginning for recent display
    return newAnnouncement;
}

// Simulate adding a new file upload (local state update only for demo)
export const addSampleFile = (fileData: Omit<UploadedFile, 'id' | 'uploadDate'>): UploadedFile => {
    const newFile: UploadedFile = {
        ...fileData,
        id: `file${sampleUploadedFiles.length + 1}`,
        uploadDate: new Date(),
    };
    sampleUploadedFiles.unshift(newFile); // Add to beginning
    return newFile;
}

// Simulate adding a user (local state update only for demo)
export const addSampleUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
        ...userData,
        id: `${userData.role}${sampleUsers.filter(u => u.role === userData.role).length + 1}`,
    };
    sampleUsers.push(newUser);
    return newUser;
};

// Simulate adding a course (local state update only for demo)
export const addSampleCourse = (courseData: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
        ...courseData,
        id: `course${sampleCourses.length + 1}`,
    };
    sampleCourses.push(newCourse);
    return newCourse;
}
