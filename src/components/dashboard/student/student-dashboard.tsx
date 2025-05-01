
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import {
    sampleCourses as initialSampleCourses, // Use initial data for reference
    sampleEnrollments as initialSampleEnrollments, // Use initial data for initialization
    getCoursesByStudent, // Helper still useful
    getUpcomingAssignmentsForStudent,
    getRecentGradesForStudent,
    getAnnouncementsForStudent,
    sampleUsers, // Import sampleUsers
    sampleAssignments, // Import assignments for grades lookup
    sampleGrades, // Import sampleGrades for analytics
    updateSampleEnrollments, // Import the update function
    type Course,
    type Enrollment,
    type Assignment,
    type Grade,
    type Announcement
} from '@/lib/sample-data';
import { PlusCircle, CheckCircle, BookOpen, Clock, FileText, Award, Megaphone, Wand2, BarChart2 } from 'lucide-react'; // Added icons
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns'; // For date formatting
import { Badge } from '@/components/ui/badge';
import { StudyPlannerDialog } from './study-planner-dialog'; // Import Study Planner Dialog
import { ProgressAnalyticsDialog } from './progress-analytics-dialog'; // Import Progress Analytics Dialog

export function StudentDashboard() {
  const { userId } = useAuth(); // Get the sample userId
  const { toast } = useToast();

  // State for data - Initialize with current global sample data
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialSampleEnrollments); // Local state for enrollments
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]); // Use full grades list for analytics
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

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

        // Fetch other student-specific data using helpers (these read from global samples)
        setUpcomingAssignments(getUpcomingAssignmentsForStudent(userId, 14)); // Look 2 weeks ahead
        // Get ALL grades for the student for analytics, not just recent
        setRecentGrades(sampleGrades.filter(grade => grade.studentId === userId));
        setRecentAnnouncements(getAnnouncementsForStudent(userId, 5)); // Keep recent announcements limited

    } else {
        // If no userId (not logged in or role mismatch in demo), show defaults
        setEnrolledCourses([]);
        setAvailableCourses(initialSampleCourses); // Show all as available
        // Do not reset enrollments here, let it persist unless explicitly changed
        setUpcomingAssignments([]);
        setRecentGrades([]); // Clear grades if no user
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

    // Simulate enrollment by adding to local state
    const newEnrollment: Enrollment = {
        studentId: userId,
        courseId: courseId,
        enrolledDate: new Date(),
    };
    const updatedEnrollments = [...enrollments, newEnrollment];
    setEnrollments(updatedEnrollments); // Update local state -> triggers useEffect
    updateSampleEnrollments(updatedEnrollments); // Update the "global" sample data for demo consistency elsewhere

    const enrolledCourse = initialSampleCourses.find(c => c.id === courseId);
    toast({ title: "Enrollment Successful", description: `You have enrolled in "${enrolledCourse?.title ?? 'the course'}".` });
     // Note: In a real app, this would be an API call to update the database.
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Student Dashboard</h1>
      {/* Ensure sampleUsers is available before trying to find the user */}
      <p className="text-lg text-muted-foreground">Welcome back, {userId && sampleUsers ? sampleUsers.find(u=>u.id===userId)?.name : 'Student'}!</p>

       {/* Dashboard Overview Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Enrolled Courses & Available Courses */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Enrolled Courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> My Enrolled Courses</CardTitle>
                    {/* Optional: Link to view all courses */}
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
                                <Button variant="outline" size="sm" disabled>Go to Course</Button> {/* Placeholder */}
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
                    <CardTitle className="text-lg font-medium flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-accent"/> Available Courses</CardTitle>
                     <CardDescription>Browse and enroll in new courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {availableCourses.length > 0 ? (
                        <ScrollArea className="h-60"> {/* Increased height slightly */}
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
                                            variant={"default"} // Always show enroll button clearly
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
                         <CardDescription>Assignments due soon.</CardDescription>
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
                                                <p className="text-xs text-red-600 dark:text-red-400">Due: {format(assign.dueDate, 'PP')} ({formatDistanceToNow(assign.dueDate, { addSuffix: true })})</p>
                                                 <Button variant="link" size="sm" className="h-auto p-0 mt-1" disabled>View Details</Button>
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

                 {/* Recent Grades */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center"><Award className="mr-2 h-5 w-5 text-primary"/> Recent Grades</CardTitle>
                     <CardDescription>Your latest assignment results.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {/* Display only a few recent grades here, analytics dialog shows all */}
                      {recentGrades.length > 0 ? (
                        <ScrollArea className="h-40">
                            <ul className="space-y-2">
                                {/* Sort grades by date descending for display */}
                                {recentGrades.sort((a, b) => b.gradedDate.getTime() - a.gradedDate.getTime()).slice(0, 5).map(grade => {
                                     const assignment = sampleAssignments.find(a => a.id === grade.assignmentId);
                                     const course = enrolledCourses.find(c => c.id === grade.courseId);
                                     const percentage = grade.maxScore > 0 ? ((grade.score / grade.maxScore) * 100).toFixed(0) : 'N/A';
                                     const scoreValid = !isNaN(parseInt(percentage));
                                     const variant : "success" | "secondary" | "destructive" | "default" | "outline" | null | undefined = scoreValid ? (parseInt(percentage) >= 80 ? "success" : parseInt(percentage) >= 60 ? "secondary" : "destructive") : "outline";

                                    return (
                                         <li key={grade.id} className="text-sm p-2 border rounded bg-background shadow-sm">
                                            <div className="flex justify-between items-start">
                                                 <div>
                                                    <p className="font-medium" title={assignment?.title ?? 'Unknown Assignment'}>{assignment?.title ?? 'Unknown Assignment'}</p>
                                                    <p className="text-xs text-muted-foreground">Course: {course?.title ?? 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">Graded: {format(grade.gradedDate, 'PP')}</p>
                                                </div>
                                                 <Badge variant={variant}>
                                                    {grade.score}/{grade.maxScore} {scoreValid ? `(${percentage}%)` : ''}
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
                       {/* Link to Progress Analytics Dialog */}
                       <ProgressAnalyticsDialog
                           grades={recentGrades} // Pass all grades
                           assignments={sampleAssignments}
                           enrolledCourses={enrolledCourses}
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
                                        const course = enrolledCourses.find(c => c.id === ann.courseId);
                                        const professor = sampleUsers.find(u => u.id === ann.professorId);
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


       {/* Include Chatbot - Full Width Below Grid */}
       <div className="mt-6">
            <Chatbot />
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
                        enrolledCourses={enrolledCourses}
                        upcomingAssignments={upcomingAssignments}
                     />
                </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/> My Progress</CardTitle>
                <CardDescription>View your overall course progress and performance analytics.</CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Progress Analytics Dialog Trigger */}
                  <ProgressAnalyticsDialog
                     grades={recentGrades} // Pass all grades
                     assignments={sampleAssignments}
                     enrolledCourses={enrolledCourses}
                   />
              </CardContent>
            </Card>
       </div>
    </div>
  );
}
