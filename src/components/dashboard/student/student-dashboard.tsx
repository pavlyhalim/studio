
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import {
    initialSampleCourses,
    getInitialSampleUsersForClient,
    initialSampleEnrollments,
    initialSampleAssignments,
    getGradesForStudent, // Use new function
    initialSampleAnnouncements, // Use initial arrays
    initialSampleUploadedFiles, // Use initial arrays
    getCoursesByStudent,
    getUpcomingAssignmentsForStudent,
    getAnnouncementsForStudent,
    getFilesForStudent,
    createSampleEnrollment, // Use create function
    mockUsersDb, // Need mock DB to find professor name
    type Course,
    type Enrollment,
    type Assignment,
    type Grade,
    type Announcement,
    type UploadedFile,
    type User // Import full User type for professor lookup
} from '@/lib/sample-data';
import { PlusCircle, BookOpen, Clock, FileText, Award, Megaphone, Wand2, BarChart2, Download, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StudyPlannerDialog } from './study-planner-dialog';
import { ProgressAnalyticsDialog } from './progress-analytics-dialog';

// Define SimpleUser type without password hash for client-side state
type SimpleUser = Omit<User, 'passwordHash'>;


export function StudentDashboard() {
  // Use simplified user object from useAuth
  const { user, userId } = useAuth();
  const { toast } = useToast();

  // State for data - Initialize based on initial sample data arrays
  // We manage enrollments locally to simulate adding/removing
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialSampleEnrollments);
  // Other data is derived or filtered based on enrollments/userId
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]); // All grades for analytics
  const [recentGradesDisplay, setRecentGradesDisplay] = useState<Grade[]>([]); // Grades for dashboard display
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [courseFiles, setCourseFiles] = useState<UploadedFile[]>([]); // State for files

  // Memoize student's name from user object if available
  const studentName = useMemo(() => {
    return user?.name ?? 'Student'; // Use logged-in user's name or default
  }, [user]);


  // Effect to derive student-specific data when userId or enrollments change
  useEffect(() => {
    if (userId) {
        // Filter enrollments for the current user from local state
        const userEnrollments = enrollments.filter(e => e.studentId === userId);
        const enrolledCourseIds = userEnrollments.map(e => e.courseId);

        // Get enrolled and available courses based on local enrollments state and initial course list
        const studentEnrolledCourses = initialSampleCourses.filter(c => enrolledCourseIds.includes(c.id));
        const studentAvailableCourses = initialSampleCourses.filter(c => !enrolledCourseIds.includes(c.id));

        setEnrolledCourses(studentEnrolledCourses);
        setAvailableCourses(studentAvailableCourses);

        // Fetch other student-specific data using helpers (these read from the mutable initial arrays)
        setUpcomingAssignments(getUpcomingAssignmentsForStudent(userId, 14)); // Look 2 weeks ahead

        // Get ALL grades for the student for analytics
        const studentAllGrades = getGradesForStudent(userId);
        setAllGrades(studentAllGrades);

        // Get recent grades for dashboard display (sorted and sliced)
        setRecentGradesDisplay(
            [...studentAllGrades] // Create a copy before sorting
                .sort((a, b) => b.gradedDate.getTime() - a.gradedDate.getTime())
                .slice(0, 5) // Limit display on dashboard
        );

        // Get recent announcements and files for enrolled courses
        setRecentAnnouncements(getAnnouncementsForStudent(userId, 5));
        setCourseFiles(getFilesForStudent(userId));

    } else {
        // If no userId (not logged in or role mismatch in demo), show defaults
        setEnrolledCourses([]);
        setAvailableCourses(initialSampleCourses); // Show all as available
        setUpcomingAssignments([]);
        setRecentGradesDisplay([]);
        setAllGrades([]);
        setRecentAnnouncements([]);
        setCourseFiles([]);
    }
  }, [userId, enrollments]); // Rerun when userId or local enrollments change

  const handleEnroll = (courseId: string) => {
    if (!userId) {
        toast({ title: "Login Required", description: "Please log in to enroll in courses.", variant: "destructive" });
        return;
    }

    // Check if already enrolled (based on local state)
    if (enrollments.some(e => e.studentId === userId && e.courseId === courseId)) {
        toast({ title: "Already Enrolled", description: "You are already enrolled in this course.", variant: "default" });
        return;
    }

    // **Simulate enrollment**: Create a new enrollment object (this MUTATES the sample data array)
    const newEnrollment = createSampleEnrollment(userId, courseId);

    // Update local state to trigger re-render
    // This ensures the UI reflects the change immediately
    setEnrollments(currentEnrollments => [...currentEnrollments, newEnrollment]);

    const enrolledCourse = initialSampleCourses.find(c => c.id === courseId);
    toast({ title: "Enrollment Successful", description: `You have enrolled in "${enrolledCourse?.title ?? 'the course'}"` });
    // The useEffect hook will automatically update enrolledCourses and availableCourses
  };

   // Function to get professor name from ID using mock DB
   const getProfessorName = (profId: string | undefined): string => {
        if (!profId) return 'N/A';
        // Find the user in the mock DB by ID
        for (const userEntry of mockUsersDb.values()) {
            if (userEntry.id === profId && userEntry.role === 'professor') {
                return userEntry.name;
            }
        }
        return 'Unknown Professor';
    };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Student Dashboard</h1>
      {/* Updated welcome message to use memoized studentName */}
      <p className="text-lg text-muted-foreground">Welcome back, {studentName}!</p>

       {/* Dashboard Overview Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Enrolled Courses & Available Courses */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Enrolled Courses */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> My Enrolled Courses ({enrolledCourses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {enrolledCourses.length > 0 ? (
                        <ScrollArea className="h-48 pr-4">
                        <ul className="space-y-3">
                            {enrolledCourses.map(course => (
                            <li key={course.id} className="flex justify-between items-center p-3 border rounded-md bg-secondary/20 shadow-sm transition-colors hover:bg-secondary/30">
                                <div>
                                    <span className="font-medium text-primary">{course.title}</span>
                                    <p className="text-sm text-muted-foreground">{course.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Professor: {getProfessorName(course.professorId)}</p>
                                </div>
                                <Button variant="ghost" size="sm" disabled className="text-primary/70 hover:text-primary">Go to Course</Button>
                            </li>
                            ))}
                        </ul>
                        </ScrollArea>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">You are not enrolled in any courses yet.</p>
                    )}
                    </CardContent>
                </Card>

                {/* Available Courses */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent"/> Available Courses ({availableCourses.length})</CardTitle>
                        <CardDescription>Browse and enroll in new courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {availableCourses.length > 0 ? (
                        <ScrollArea className="h-60 pr-4">
                        <ul className="space-y-3">
                            {availableCourses.map(course => (
                            <li key={course.id}>
                                <Card className="shadow-sm hover:shadow-md transition-shadow bg-background">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-base font-semibold text-primary">{course.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                                        <p className="text-xs text-muted-foreground">Professor: {getProfessorName(course.professorId)}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={!userId} // Disable if not logged in (or demo mode without ID)
                                            variant="default"
                                            className="bg-accent hover:bg-accent/90"
                                            aria-label={`Enroll in ${course.title}`}
                                         >
                                             <PlusCircle className="mr-2 h-4 w-4" /> Enroll
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </li>
                            ))}
                        </ul>
                        </ScrollArea>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No other courses available at the moment.</p>
                    )}
                    </CardContent>
                </Card>
            </div>

            {/* Column 2: Assignments, Grades, Announcements */}
            <div className="space-y-6">
                 {/* Upcoming Assignments */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><Clock className="mr-2 h-5 w-5 text-destructive"/> Upcoming Deadlines</CardTitle>
                        <CardDescription>Assignments due within the next 14 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingAssignments.length > 0 ? (
                            <ScrollArea className="h-40 pr-4">
                                <ul className="space-y-2">
                                    {upcomingAssignments.map(assign => {
                                        const course = enrolledCourses.find(c => c.id === assign.courseId);
                                        return (
                                            <li key={assign.id} className="text-sm p-3 border-l-4 border-destructive/70 rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors">
                                                <p className="font-medium text-primary">{assign.title}</p>
                                                <p className="text-xs text-muted-foreground">Course: {course?.title ?? 'N/A'}</p>
                                                <p className="text-xs text-destructive/90">
                                                    Due: {format(assign.dueDate, 'PPp')} ({formatDistanceToNow(assign.dueDate, { addSuffix: true })})
                                                </p>
                                                 <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs text-accent hover:text-accent/80" disabled>View Details</Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                        )}
                    </CardContent>
                </Card>

                 {/* Recent Grades Display */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center"><Award className="mr-2 h-5 w-5 text-green-600"/> Recent Grades</CardTitle>
                     <CardDescription>Your latest assignment results.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {recentGradesDisplay.length > 0 ? (
                        <ScrollArea className="h-40 pr-4">
                            <ul className="space-y-2">
                                {recentGradesDisplay.map(grade => {
                                     // Find assignment using the mutable initialSampleAssignments array
                                     const assignment = initialSampleAssignments.find(a => a.id === grade.assignmentId);
                                     const course = initialSampleCourses.find(c => c.id === grade.courseId);
                                     const maxScore = assignment?.maxScore ?? 100; // Fallback max score
                                     const percentage = maxScore > 0 ? Math.round((grade.score / maxScore) * 100) : 0;
                                     const scoreValid = maxScore > 0;
                                     const variant : "success" | "secondary" | "destructive" | "default" | "outline" | null | undefined = scoreValid ? (percentage >= 80 ? "success" : percentage >= 60 ? "secondary" : "destructive") : "outline";

                                    return (
                                         <li key={grade.id} className="text-sm p-3 border rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                 <div className="flex-grow overflow-hidden">
                                                    <p className="font-medium text-primary truncate" title={assignment?.title ?? 'Unknown Assignment'}>
                                                        {assignment?.title ?? 'Unknown Assignment'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate" title={course?.title ?? 'N/A'}>Course: {course?.title ?? 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">Graded: {format(grade.gradedDate, 'PP')}</p>
                                                </div>
                                                 <Badge variant={variant} className="ml-2 flex-shrink-0">
                                                    {scoreValid ? `${grade.score}/${maxScore} (${percentage}%)` : 'N/A'}
                                                </Badge>
                                            </div>
                                            {grade.feedback && <p className="text-xs text-muted-foreground mt-1 italic border-l-2 pl-2">Feedback: {grade.feedback}</p>}
                                        </li>
                                    )
                                })}
                            </ul>
                        </ScrollArea>
                     ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent grades.</p>
                     )}
                  </CardContent>
                   <CardFooter>
                       {/* Pass all grades and all assignments for full analytics */}
                       <ProgressAnalyticsDialog
                           grades={allGrades}
                           assignments={initialSampleAssignments}
                           enrolledCourses={enrolledCourses}
                        />
                   </CardFooter>
                </Card>

                 {/* Recent Announcements */}
                 <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><Megaphone className="mr-2 h-5 w-5 text-accent"/> Recent Announcements</CardTitle>
                        <CardDescription>Latest updates from your courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {recentAnnouncements.length > 0 ? (
                            <ScrollArea className="h-48 pr-4">
                                <ul className="space-y-3">
                                    {recentAnnouncements.map(ann => {
                                        const course = initialSampleCourses.find(c => c.id === ann.courseId);
                                        const professorName = getProfessorName(ann.professorId);
                                        return (
                                             <li key={ann.id} className="text-sm p-3 border rounded bg-secondary/10 shadow-sm hover:bg-secondary/20 transition-colors">
                                                <p className="font-semibold text-primary">{ann.title}</p>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    From: {professorName} | Course: {course?.title ?? 'N/A'} | {formatDistanceToNow(ann.postedDate, { addSuffix: true })}
                                                </p>
                                                <p className="whitespace-pre-wrap text-foreground/90">{ann.content}</p>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </ScrollArea>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No recent announcements.</p>
                        )}
                    </CardContent>
                 </Card>
            </div>
       </div>

        {/* Course Materials Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/> Course Materials</CardTitle>
                <CardDescription>Files uploaded by professors for your enrolled courses.</CardDescription>
            </CardHeader>
            <CardContent>
                {courseFiles.length > 0 ? (
                    <ScrollArea className="h-60 pr-4">
                        <ul className="space-y-2">
                            {courseFiles.map(file => {
                                const course = enrolledCourses.find(c => c.id === file.courseId);
                                return (
                                    <li key={file.id} className="flex items-center justify-between p-3 border rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors text-sm group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {file.fileType.startsWith('video/') ? <Video className="h-5 w-5 text-muted-foreground flex-shrink-0"/> : <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0"/>}
                                            <div className="flex-grow overflow-hidden">
                                                <p className="font-medium text-primary truncate" title={file.fileName}>{file.fileName}</p>
                                                <p className="text-xs text-muted-foreground truncate" title={course?.title ?? 'N/A'}>Course: {course?.title ?? 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">Uploaded: {format(file.uploadDate, 'PP')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge variant="outline" className="text-xs">{file.sizeKB} KB</Badge>
                                            {/* Use 'a' tag for download/play */}
                                            <Button variant="outline" size="sm" asChild disabled={!file.url || file.url === '#'} aria-label={`${file.fileType.startsWith('video/') ? 'Play' : 'Download'} file ${file.fileName}`}>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" download={!file.fileType.startsWith('video/') ? file.fileName : undefined}>
                                                    <Download className="mr-1 h-3 w-3" /> {file.fileType.startsWith('video/') ? 'Play' : 'Download'}
                                                </a>
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </ScrollArea>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No course materials available yet.</p>
                )}
            </CardContent>
        </Card>


       {/* Functional Student Sections */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
           <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> Study Planner</CardTitle>
                    <CardDescription>Generate an AI-powered study plan based on your courses and goals.</CardDescription>
                </CardHeader>
                <CardContent>
                     {/* Pass the currently upcoming assignments */}
                     <StudyPlannerDialog
                        enrolledCourses={enrolledCourses}
                        upcomingAssignments={upcomingAssignments}
                     />
                </CardContent>
            </Card>
             <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/> My Progress</CardTitle>
                <CardDescription>View your overall course progress and performance analytics.</CardDescription>
              </CardHeader>
              <CardContent>
                  {/* Pass all grades and relevant assignments/courses */}
                  <ProgressAnalyticsDialog
                     grades={allGrades}
                     assignments={initialSampleAssignments} // Pass full list for lookup
                     enrolledCourses={enrolledCourses}
                   />
              </CardContent>
            </Card>
       </div>

        {/* Include Chatbot - Full Width Below Functional Sections */}
       <div className="mt-6">
            {/* Pass user object to Chatbot */}
            <Chatbot />
       </div>

    </div>
  );
}
