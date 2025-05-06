// src/lib/sample-data.ts

// --- Interfaces ---

export interface Course {
    id: string;
    title: string;
    description: string;
    professorId: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'professor' | 'admin';
    passwordHash: string;
  }
  
  export interface Enrollment {
    id: string;
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
    maxScore: number;
  }
  
  export interface Grade {
    id: string;
    studentId: string;
    assignmentId: string;
    courseId: string;
    score: number;
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
    fileType: string;
    uploadDate: Date;
    url: string;
    sizeKB: number;
  }
  
  // --- Mock Database ---
  
  export const mockUsersDb = new Map<string, User>();
  
  const hashPasswordSync = (plainPassword: string): string => {
    return plainPassword; // Plain text for sample data only
  };
  
  // Pre-defined IDs
  const student1Id = 'student-1';
  const student2Id = 'student-2';
  const student3Id = 'student-3';
  const prof1Id    = 'professor-1';
  const prof2Id    = 'professor-2';
  const admin1Id   = 'admin-1';
  
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
  
  // --- Initial Sample Users ---
  
  export let initialSampleUsersData: User[] = [
    { id: student1Id, name: 'Alice Student', email: 'alice@example.com', role: 'student',   passwordHash: hashPasswordSync('password123') },
    { id: student2Id, name: 'Bob Learner',   email: 'bob@example.com',   role: 'student',   passwordHash: hashPasswordSync('password123') },
    { id: student3Id, name: 'Charlie Curious', email: 'charlie@example.com', role: 'student', passwordHash: hashPasswordSync('password123') },
    { id: prof1Id,    name: 'Dr. Charles Xavier', email: 'prof.x@example.com', role: 'professor', passwordHash: hashPasswordSync('profpass') },
    { id: prof2Id,    name: 'Dr. Eleanor Arroway', email: 'dr.e.arroway@example.com', role: 'professor', passwordHash: hashPasswordSync('profpass') },
    { id: admin1Id,   name: 'Admin User',    email: 'admin@example.com', role: 'admin',     passwordHash: hashPasswordSync('adminpass') },
  ];
  
  initialSampleUsersData.forEach(user => {
    mockUsersDb.set(user.email.toLowerCase(), user);
  });
  
  // Helper to strip passwordHash
  export const getInitialSampleUsersForClient = (): Omit<User, 'passwordHash'>[] =>
    Array.from(mockUsersDb.values()).map(({ passwordHash, ...u }) => u);
  
  // --- Initial Sample Courses ---
  
  export let initialSampleCourses: Course[] = [
    { id: course101Id, title: 'Introduction to Quantum Physics', description: 'Explore the fundamentals of quantum mechanics and its applications.', professorId: prof1Id },
    { id: course202Id, title: 'Astrobiology and Search for Life',        description: 'Investigating the possibility of life beyond Earth.',                  professorId: prof2Id },
    { id: course303Id, title: 'Advanced Mutant Ethics',                   description: 'Ethical considerations in a world with mutants.',                          professorId: prof1Id },
    { id: course404Id, title: 'Signal Processing in SETI',               description: 'Techniques for detecting extraterrestrial intelligence signals.',          professorId: prof2Id },
    { id: course505Id, title: 'Introduction to Rocket Science',          description: 'Basics of propulsion and orbital mechanics.',                             professorId: prof2Id },
  ];
  
  // --- Initial Sample Enrollments ---
  
  export let initialSampleEnrollments: Enrollment[] = [
    { id: 'enroll1', studentId: student1Id, courseId: course101Id, enrolledDate: new Date('2024-01-15') },
    { id: 'enroll2', studentId: student1Id, courseId: course303Id, enrolledDate: new Date('2024-01-15') },
    { id: 'enroll3', studentId: student2Id, courseId: course202Id, enrolledDate: new Date('2024-01-20') },
    { id: 'enroll4', studentId: student2Id, courseId: course404Id, enrolledDate: new Date('2024-01-20') },
    { id: 'enroll5', studentId: student3Id, courseId: course101Id, enrolledDate: new Date('2024-02-01') },
    { id: 'enroll6', studentId: student1Id, courseId: course505Id, enrolledDate: new Date('2024-02-10') },
  ];
  
  // --- Initial Sample Assignments ---
  
  export let initialSampleAssignments: Assignment[] = [
    {
      id: assign1Id,
      courseId: course101Id,
      title: 'Problem Set 1: Wave-Particle Duality',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: 'Solve problems related to the De Broglie wavelength and the uncertainty principle.',
      maxScore: 100,
    },
    {
      id: assign2Id,
      courseId: course101Id,
      title: 'Problem Set 2: Schrödinger Equation',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: 'Apply the time-independent Schrödinger equation to simple potentials.',
      maxScore: 100,
    },
    {
      id: assign3Id,
      courseId: course202Id,
      title: 'Research Paper: Extremophiles',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      description: 'Write a 5-page paper on life in extreme environments and its implications for astrobiology.',
      maxScore: 100,
    },
    {
      id: assign4Id,
      courseId: course303Id,
      title: 'Essay: Mutant Registration Act',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      description: 'Discuss the ethical pros and cons of a mandatory registration for mutants.',
      maxScore: 50,
    },
    {
      id: assign5Id,
      courseId: course404Id,
      title: 'Lab Report: Signal Noise Reduction',
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      description: 'Analyze simulated SETI data and apply noise reduction techniques.',
      maxScore: 100,
    },
    {
      id: assign6Id,
      courseId: course505Id,
      title: "Quiz 1: Newton's Laws",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description: "Short quiz on Newton's laws of motion.",
      maxScore: 20,
    },
  ];
  
  // --- Initial Sample Grades ---
  
  export let initialSampleGrades: Grade[] = [
    {
      id: 'grade1',
      studentId: student1Id,
      assignmentId: assign1Id,
      courseId: course101Id,
      score: 90,
      gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      feedback: 'Excellent work on the duality calculations.',
    },
    {
      id: 'grade3',
      studentId: student3Id,
      assignmentId: assign1Id,
      courseId: course101Id,
      score: 82,
      gradedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      feedback: 'Good effort, review the uncertainty principle application.',
    },
    {
      id: 'grade4',
      studentId: student2Id,
      assignmentId: assign3Id,
      courseId: course202Id,
      score: 95,
      gradedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      feedback: 'Well-researched paper with strong arguments.',
    },
    {
      id: 'grade5',
      studentId: student1Id,
      assignmentId: assign4Id,
      courseId: course303Id,
      score: 35,
      gradedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      feedback: 'Arguments need more support, but structure is good.',
    },
    {
      id: 'grade6',
      studentId: student1Id,
      assignmentId: assign6Id,
      courseId: course505Id,
      score: 18,
      gradedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    },
  ];
  
  // --- Initial Sample Announcements ---
  
  export let initialSampleAnnouncements: Announcement[] = [
    {
      id: 'ann1',
      courseId: course101Id,
      title: 'Welcome to Quantum Physics!',
      content: 'Welcome everyone! Please review the syllabus and the first reading assignment.',
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      professorId: prof1Id,
    },
    {
      id: 'ann2',
      courseId: course101Id,
      title: 'Office Hours Update',
      content: 'My office hours for this week will be moved to Wednesday 2-3 PM.',
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      professorId: prof1Id,
    },
    {
      id: 'ann3',
      courseId: course202Id,
      title: 'Guest Lecture Next Week',
      content: 'We will have a guest lecture from Dr. Jill Tarter on the SETI project next Tuesday.',
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      professorId: prof2Id,
    },
    {
      id: 'ann4',
      courseId: course505Id,
      title: 'First Quiz Reminder',
      content: "Don't forget the first quiz on Newton's Laws is due soon!",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      professorId: prof2Id,
    },
  ];
  
  // --- Initial Sample Uploaded Files ---
  
  export let initialSampleUploadedFiles: UploadedFile[] = [
    {
      id: 'file1',
      courseId: course101Id,
      professorId: prof1Id,
      fileName: 'Syllabus_QuantumPhysics.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 150,
    },
    {
      id: 'file2',
      courseId: course101Id,
      professorId: prof1Id,
      fileName: 'Lecture1_Intro.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 512,
    },
    {
      id: 'file3',
      courseId: course202Id,
      professorId: prof2Id,
      fileName: 'Astrobiology_ReadingList.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 80,
    },
    {
      id: 'file4',
      courseId: course303Id,
      professorId: prof1Id,
      fileName: 'MutantEthics_CaseStudies.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 45,
    },
    {
      id: 'file5',
      courseId: course101Id,
      professorId: prof1Id,
      fileName: 'Intro_To_Quantum_Video.mp4',
      fileType: 'video/mp4',
      uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 25600,
    },
    {
      id: 'file6',
      courseId: course202Id,
      professorId: prof2Id,
      fileName: 'Lecture_DrakeEquation.mp4',
      fileType: 'video/mp4',
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 31500,
    },
    {
      id: 'file7',
      courseId: course505Id,
      professorId: prof2Id,
      fileName: 'Rocket_Engine_Types.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      url: '#',
      sizeKB: 850,
    },
  ];
  
  // --- Helper Functions ---
  
  export const getCoursesByProfessor = (professorId: string): Course[] =>
    initialSampleCourses.filter(c => c.professorId === professorId);
  
  export const getStudentsInCourse = (courseId: string): Omit<User, 'passwordHash'>[] => {
    const ids = initialSampleEnrollments
      .filter(e => e.courseId === courseId)
      .map(e => e.studentId);
    return Array.from(mockUsersDb.values())
      .filter(u => u.role === 'student' && ids.includes(u.id))
      .map(({ passwordHash, ...u }) => u);
  };
  
  export const getCoursesByStudent = (studentId: string): Course[] => {
    const ids = initialSampleEnrollments.filter(e => e.studentId === studentId).map(e => e.courseId);
    return initialSampleCourses.filter(c => ids.includes(c.id));
  };
  
  export const getAssignmentsByCourse = (courseId: string): Assignment[] =>
    initialSampleAssignments.filter(a => a.courseId === courseId);
  
  export const getUpcomingAssignmentsForStudent = (studentId: string, daysAhead = 14): Assignment[] => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const enrolledIds = getCoursesByStudent(studentId).map(c => c.id);
    return initialSampleAssignments
      .filter(a => enrolledIds.includes(a.courseId) && a.dueDate > now && a.dueDate <= cutoff)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };
  
  export const getGradesForStudent = (studentId: string): Grade[] =>
    initialSampleGrades.filter(g => g.studentId === studentId);
  
  export const getAnnouncementsForStudent = (studentId: string, limit?: number): Announcement[] => {
    const enrolledIds = getCoursesByStudent(studentId).map(c => c.id);
    const anns = initialSampleAnnouncements
      .filter(a => enrolledIds.includes(a.courseId))
      .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
    return limit ? anns.slice(0, limit) : anns;
  };
  
  export const getFilesForStudent = (studentId: string): UploadedFile[] => {
    const enrolledIds = getCoursesByStudent(studentId).map(c => c.id);
    return initialSampleUploadedFiles
      .filter(f => enrolledIds.includes(f.courseId))
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  };
  
  // (Mutation helpers omitted for brevity…)
// --- Mutation Helpers (simulate create/delete operations) ---

// Create a new user (for demo only)
export const createSampleUser = (userData: Omit<User, 'id' | 'passwordHash'> & { passwordPlain: string }): User => {
    const hash = hashPasswordSync(userData.passwordPlain);
    const newUser: User = {
      id: `${userData.role}-${userData.name.split(' ')[0].toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role,
      passwordHash: hash,
    };
    mockUsersDb.set(newUser.email, newUser);
    initialSampleUsersData.push(newUser);
    console.log(`User ${newUser.email} added to mock DB.`);
    return newUser;
  };
  
  // Create a new course
  export const createSampleCourse = (courseData: Omit<Course, 'id'>): Course | { error: string } => {
    if (initialSampleCourses.some(c => c.title.toLowerCase() === courseData.title.toLowerCase())) {
      return { error: `Course with title "${courseData.title}" already exists.` };
    }
    const newCourse: Course = {
      ...courseData,
      id: `course${Date.now()}`,
    };
    initialSampleCourses.push(newCourse);
    console.log(`Course "${newCourse.title}" added to demo data.`);
    return newCourse;
  };
  
  // Create a new announcement
  export const createSampleAnnouncement = (announcementData: Omit<Announcement, 'id' | 'postedDate'>): Announcement => {
    const newAnn: Announcement = {
      ...announcementData,
      id: `ann${Date.now()}`,
      postedDate: new Date(),
    };
    initialSampleAnnouncements.push(newAnn);
    console.log(`Announcement "${newAnn.title}" added to demo data.`);
    return newAnn;
  };
  
  // Create a new file upload
  export const createSampleFile = (fileData: Omit<UploadedFile, 'id' | 'uploadDate'>): UploadedFile => {
    const newFile: UploadedFile = {
      ...fileData,
      id: `file${Date.now()}`,
      uploadDate: new Date(),
      url: fileData.url || '#',
    };
    initialSampleUploadedFiles.push(newFile);
    console.log(`File "${newFile.fileName}" added to demo data.`);
    return newFile;
  };
  
  // Create a new enrollment
  export const createSampleEnrollment = (studentId: string, courseId: string): Enrollment => {
    const newEnroll: Enrollment = {
      id: `enroll${Date.now()}`,
      studentId,
      courseId,
      enrolledDate: new Date(),
    };
    initialSampleEnrollments.push(newEnroll);
    console.log(`Enrollment for student ${studentId} in course ${courseId} added.`);
    return newEnroll;
  };
  
  // Delete a user and cascade-remove related data
  export const deleteSampleUser = (userId: string): boolean => {
    const user = initialSampleUsersData.find(u => u.id === userId);
    if (!user) return false;
  
    // Remove from mockUsersDb and array
    mockUsersDb.delete(user.email.toLowerCase());
    initialSampleUsersData = initialSampleUsersData.filter(u => u.id !== userId);
  
    // Cascade delete enrollments, grades
    initialSampleEnrollments = initialSampleEnrollments.filter(e => e.studentId !== userId);
    initialSampleGrades = initialSampleGrades.filter(g => g.studentId !== userId);
  
    // If professor, remove their courses' announcements and files, reassign courses
    if (user.role === 'professor') {
      initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.professorId !== userId);
      initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.professorId !== userId);
      initialSampleCourses = initialSampleCourses.map(c =>
        c.professorId === userId ? { ...c, professorId: 'unassigned' } : c
      );
    }
  
    console.log(`User ${userId} and related data removed.`);
    return true;
  };
  
  // Delete a course and cascade-remove related data
  export const deleteSampleCourse = (courseId: string): boolean => {
    const before = initialSampleCourses.length;
    initialSampleCourses = initialSampleCourses.filter(c => c.id !== courseId);
    if (initialSampleCourses.length === before) return false;
  
    initialSampleEnrollments = initialSampleEnrollments.filter(e => e.courseId !== courseId);
    initialSampleAssignments = initialSampleAssignments.filter(a => a.courseId !== courseId);
    initialSampleGrades = initialSampleGrades.filter(g => g.courseId !== courseId);
    initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.courseId !== courseId);
    initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.courseId !== courseId);
  
    console.log(`Course ${courseId} and related data removed.`);
    return true;
  };
  
  // Delete a file
  export const deleteSampleFile = (fileId: string): boolean => {
    const before = initialSampleUploadedFiles.length;
    initialSampleUploadedFiles = initialSampleUploadedFiles.filter(f => f.id !== fileId);
    if (initialSampleUploadedFiles.length === before) return false;
  
    console.log(`File ${fileId} removed.`);
    return true;
  };
  
  // Delete an announcement
  export const deleteSampleAnnouncement = (announcementId: string): boolean => {
    const before = initialSampleAnnouncements.length;
    initialSampleAnnouncements = initialSampleAnnouncements.filter(a => a.id !== announcementId);
    if (initialSampleAnnouncements.length === before) return false;
  
    console.log(`Announcement ${announcementId} removed.`);
    return true;
  };
    