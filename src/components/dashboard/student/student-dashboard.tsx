
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import {
    initialSampleCourses,
    initialSampleUsers,
    initialSampleEnrollments,
    initialSampleAssignments,
    initialSampleGrades,
    initialSampleAnnouncements,
    getCoursesByStudent,
    getUpcomingAssignmentsForStudent,
    getRecentGradesForStudent, // Get limited recent grades for dashboard view
    getAnnouncementsForStudent,
    createSampleEnrollment, // Use create function
    type Course,
    type Enrollment,
    type Assignment,
    type Grade,
    type Announcement
} from '@/lib/sample-data';
import { PlusCircle, CheckCircle, BookOpen, Clock, FileText, Award, Megaphone, Wand2, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StudyPlannerDialog } from './study-planner-dialog';
import { ProgressAnalyticsDialog } from './progress-analytics-dialog';

export function StudentDashboard() {
  const { userId } = useAuth(); // Get the sample userId from context
  const { toast } = useToast();

  // State for data - Initialize based on initial sample data
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialSampleEnrollments); // Local state for enrollments
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentGradesDisplay, setRecentGradesDisplay] = useState<Grade[]>([]); // Grades for dashboard display
  const [allGrades, setAllGrades] = useState<Grade[]>([]); // All grades for analytics
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

  // Memoize student's name
  const studentName = useMemo(() => {
    return initialSampleUsers.find(u => u.id === userId)?.name ?? 'Student';
  }, [userId]);


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

        // Fetch other student-specific data using helpers (these read from initial samples)
        setUpcomingAssignments(getUpcomingAssignmentsForStudent(userId, 14)); // Look 2 weeks ahead

        // Get ALL grades for the student for analytics
        const studentAllGrades = initialSampleGrades.filter(grade => grade.studentId === userId);
        setAllGrades(studentAllGrades);
        // Get recent grades for dashboard display
        setRecentGradesDisplay(
            studentAllGrades
                .sort((a, b) => b.gradedDate.getTime() - a.gradedDate.getTime())
                .slice(0, 5) // Limit display on dashboard
        );

        setRecentAnnouncements(getAnnouncementsForStudent(userId, 5)); // Keep recent announcements limited

    } else {
        // If no userId (not logged in or role mismatch in demo), show defaults
        setEnrolledCourses([]);
        setAvailableCourses(initialSampleCourses); // Show all as available
        // Do not reset enrollments here, let it persist unless explicitly changed by login/logout
        setUpcomingAssignments([]);
        setRecentGradesDisplay([]); // Clear grades display if no user
        setAllGrades([]); // Clear all grades if no user
        setRecentAnnouncements([]);
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

    // Simulate enrollment by creating a new enrollment object
    const newEnrollment = createSampleEnrollment(userId, courseId);

    // Update local enrollments state immutably
    setEnrollments(currentEnrollments => [...currentEnrollments, newEnrollment]);

    const enrolledCourse = initialSampleCourses.find(c => c.id === courseId);
    toast({ title: "Enrollment Successful", description: `You have enrolled in "${enrolledCourse?.title ?? 'the course'}" (simulated).` });
     // Note: In a real app, this would involve an API call to update the database,
     // and potentially refetching data or relying on optimistic updates.
     // The updateSampleEnrollments function is removed as we manage state locally.
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Student Dashboard</h1>
      <p className="text-lg text-muted-foreground">Welcome back, {studentName}!</p>

       {/* Dashboard Overview Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Enrolled Courses & Available Courses */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Enrolled Courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> My Enrolled Courses ({enrolledCourses.length})</CardTitle>
                        {/* Optional: Link to view all courses page */}
                    </CardHeader>
                    <CardContent>
                    {enrolledCourses.length > 0 ? (
                        <ScrollArea className="h-48">
                        <ul className="space-y-3">
                            {enrolledCourses.map(course => (
                            <li key={course.id} className="flex justify-between items-center p-3 border rounded-md bg-secondary/20 shadow-sm">
                                <div>
                                    <span className="font-medium">{course.title}</span>
                                    <p className="text-sm text-muted-foreground">{course.description}</p>
                                </div>
                                {/* TODO: Implement link/navigation to actual course page */}
                                <Button variant="outline" size="sm" disabled>Go to Course</Button>
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent"/> Available Courses ({availableCourses.length})</CardTitle>
                        <CardDescription>Browse and enroll in new courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {availableCourses.length > 0 ? (
                        <ScrollArea className="h-60">
                        <ul className="space-y-3">
                            {availableCourses.map(course => (
                            <li key={course.id}>
                                <Card className="shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-base font-semibold">{course.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={!userId} // Disable if not logged in
                                            variant={"default"} // Consistent primary action style
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><Clock className="mr-2 h-5 w-5 text-primary"/> Upcoming Deadlines</CardTitle>
                        <CardDescription>Assignments due within the next 14 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingAssignments.length > 0 ? (
                            <ScrollArea className="h-40">
                                <ul className="space-y-2">
                                    {upcomingAssignments.map(assign => {
                                        // Find course from the student's *enrolled* courses state
                                        const course = enrolledCourses.find(c => c.id === assign.courseId);
                                        return (
                                            <li key={assign.id} className="text-sm p-2 border-l-4 border-primary rounded bg-background shadow-sm">
                                                <p className="font-medium">{assign.title}</p>
                                                <p className="text-xs text-muted-foreground">Course: {course?.title ?? 'N/A'}</p>
                                                {/* Explicit red color for due date */}
                                                <p className="text-xs text-red-600 dark:text-red-400">
                                                    Due: {format(assign.dueDate, 'PP')} ({formatDistanceToNow(assign.dueDate, { addSuffix: true })})
                                                </p>
                                                 {/* TODO: Implement navigation to assignment details */}
                                                 <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs" disabled>View Details</Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines in the next 14 days.</p>
                        )}
                    </CardContent>
                </Card>

                 {/* Recent Grades Display */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center"><Award className="mr-2 h-5 w-5 text-primary"/> Recent Grades</CardTitle>
                     <CardDescription>Your latest assignment results.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {recentGradesDisplay.length > 0 ? (
                        <ScrollArea className="h-40">
                            <ul className="space-y-2">
                                {recentGradesDisplay.map(grade => {
                                     // Find assignment and course info from initial data
                                     const assignment = initialSampleAssignments.find(a => a.id === grade.assignmentId);
                                     const course = initialSampleCourses.find(c => c.id === grade.courseId);
                                     const percentage = grade.maxScore > 0 ? Math.round((grade.score / grade.maxScore) * 100) : 0;
                                     const scoreValid = grade.maxScore > 0;
                                     const variant : "success" | "secondary" | "destructive" | "default" | "outline" | null | undefined = scoreValid ? (percentage >= 80 ? "success" : percentage >= 60 ? "secondary" : "destructive") : "outline";

                                    return (
                                         <li key={grade.id} className="text-sm p-2 border rounded bg-background shadow-sm">
                                            <div className="flex justify-between items-start">
                                                 <div>
                                                    <p className="font-medium truncate max-w-[180px]" title={assignment?.title ?? 'Unknown Assignment'}>
                                                        {assignment?.title ?? 'Unknown Assignment'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Course: {course?.title ?? 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">Graded: {format(grade.gradedDate, 'PP')}</p>
                                                </div>
                                                 <Badge variant={variant} className="ml-2 flex-shrink-0">
                                                    {scoreValid ? `${grade.score}/${grade.maxScore} (${percentage}%)` : 'N/A'}
                                                </Badge>
                                            </div>
                                            {grade.feedback && <p className="text-xs text-muted-foreground mt-1 italic">Feedback: {grade.feedback}</p>}
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
                       {/* Progress Analytics Dialog Trigger - Pass ALL grades */}
                       <ProgressAnalyticsDialog
                           grades={allGrades}
                           assignments={initialSampleAssignments} // Pass initial assignments for lookup
                           enrolledCourses={enrolledCourses} // Pass currently enrolled courses
                        />
                   </CardFooter>
                </Card>

                 {/* Recent Announcements */}
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center"><Megaphone className="mr-2 h-5 w-5 text-accent"/> Recent Announcements</CardTitle>
                        <CardDescription>Latest updates from your courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {recentAnnouncements.length > 0 ? (
                            <ScrollArea className="h-48">
                                <ul className="space-y-3">
                                    {recentAnnouncements.map(ann => {
                                        // Find course and professor from initial data
                                        const course = initialSampleCourses.find(c => c.id === ann.courseId);
                                        const professor = initialSampleUsers.find(u => u.id === ann.professorId);
                                        return (
                                             <li key={ann.id} className="text-sm p-3 border rounded bg-secondary/10 shadow-sm">
                                                <p className="font-semibold">{ann.title}</p>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    From: {professor?.name ?? 'N/A'} | Course: {course?.title ?? 'N/A'} | {formatDistanceToNow(ann.postedDate, { addSuffix: true })}
                                                </p>
                                                <p className="whitespace-pre-wrap">{ann.content}</p>
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

       {/* Functional Student Sections */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> Study Planner</CardTitle>
                    <CardDescription>Generate an AI-powered study plan based on your courses and goals.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Study Planner Dialog Trigger */}
                     <StudyPlannerDialog
                        enrolledCourses={enrolledCourses} // Pass current enrolled courses
                        upcomingAssignments={upcomingAssignments} // Pass current upcoming assignments
                     />
                </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/> My Progress</CardTitle>
                <CardDescription>View your overall course progress and performance analytics.</CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Progress Analytics Dialog Trigger - Pass ALL grades */}
                  <ProgressAnalyticsDialog
                     grades={allGrades}
                     assignments={initialSampleAssignments}
                     enrolledCourses={enrolledCourses}
                   />
              </CardContent>
            </Card>
       </div>

        {/* Include Chatbot - Full Width Below Functional Sections */}
       <div className="mt-6">
            <Chatbot />
       </div>

    </div>
  );
}
