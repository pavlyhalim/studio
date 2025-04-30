
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

// Sample Users
export const sampleUsers: User[] = [
    { id: 'student1', name: 'Alice Student', email: 'alice@example.com', role: 'student' },
    { id: 'student2', name: 'Bob Learner', email: 'bob@example.com', role: 'student' },
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

// Sample Enrollments (Initially empty or with some defaults)
export const sampleEnrollments: Enrollment[] = [
    { studentId: 'student1', courseId: 'course101', enrolledDate: new Date('2024-01-15') },
    { studentId: 'student2', courseId: 'course202', enrolledDate: new Date('2024-01-20') },
];

// Helper function to get courses taught by a specific professor
export const getCoursesByProfessor = (professorId: string): Course[] => {
    return sampleCourses.filter(course => course.professorId === professorId);
};

// Helper function to get students enrolled in a specific course
export const getStudentsInCourse = (courseId: string): User[] => {
    const studentIds = sampleEnrollments
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId);
    return sampleUsers.filter(user => user.role === 'student' && studentIds.includes(user.id));
};

// Helper function to get courses a student is enrolled in
export const getCoursesByStudent = (studentId: string): Course[] => {
    const courseIds = sampleEnrollments
        .filter(enrollment => enrollment.studentId === studentId)
        .map(enrollment => enrollment.courseId);
    return sampleCourses.filter(course => courseIds.includes(course.id));
};
