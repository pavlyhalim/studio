
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { sampleCourses, sampleEnrollments, getCoursesByStudent, type Course, type Enrollment } from '@/lib/sample-data';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StudentDashboard() {
  const { userId } = useAuth(); // Get the sample userId
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(sampleEnrollments); // Local state for enrollments

  useEffect(() => {
    if (userId) {
        // Use the helper function to get initially enrolled courses based on sampleEnrollments
        const currentlyEnrolledIds = enrollments
            .filter(e => e.studentId === userId)
            .map(e => e.courseId);

        const studentCourses = sampleCourses.filter(c => currentlyEnrolledIds.includes(c.id));
        const notEnrolledCourses = sampleCourses.filter(c => !currentlyEnrolledIds.includes(c.id));

        setEnrolledCourses(studentCourses);
        setAvailableCourses(notEnrolledCourses);

    } else {
        // If no userId (not logged in or role mismatch in demo), show all courses as available
        setEnrolledCourses([]);
        setAvailableCourses(sampleCourses);
    }
  }, [userId, enrollments]); // Rerun when userId or enrollments change

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
    setEnrollments(prev => [...prev, newEnrollment]);

    toast({ title: "Enrollment Successful", description: `You have enrolled in the course.` }); // Find title later
     // Note: In a real app, this would be an API call to update the database.
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>

       {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>My Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length > 0 ? (
            <ScrollArea className="h-40">
              <ul className="space-y-2">
                {enrolledCourses.map(course => (
                  <li key={course.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/20">
                    <span>{course.title}</span>
                    {/* Maybe add a button to go to course page */}
                     <Button variant="ghost" size="sm" disabled>Go to Course</Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
          )}
        </CardContent>
      </Card>

       {/* Available Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
           {availableCourses.length > 0 ? (
            <ScrollArea className="h-48"> {/* Increased height */}
              <ul className="space-y-3">
                {availableCourses.map(course => (
                  <li key={course.id}>
                     <Card className="shadow-sm">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                           <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                             <Button
                                size="sm"
                                onClick={() => handleEnroll(course.id)}
                                disabled={!userId} // Disable if not logged in
                                variant={enrollments.some(e => e.studentId === userId && e.courseId === course.id) ? "outline" : "default"} // Change variant if enrolled
                             >
                                {enrollments.some(e => e.studentId === userId && e.courseId === course.id) ? (
                                     <> <CheckCircle className="mr-2 h-4 w-4" /> Enrolled </>
                                ) : (
                                    <> <PlusCircle className="mr-2 h-4 w-4" /> Enroll </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No other courses available at the moment.</p>
          )}
        </CardContent>
      </Card>

       {/* Include Chatbot */}
      <Chatbot />

      {/* Other student-specific sections */}
       <Card>
        <CardHeader>
          <CardTitle>Study Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI Study planner feature placeholder...</p>
          {/* TODO: Implement Study Planner */}
        </CardContent>
      </Card>
       <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Assignment/Quiz deadlines...</p>
            {/* TODO: Display upcoming deadlines */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent grades placeholder...</p>
            {/* TODO: Show recent grades */}
          </CardContent>
        </Card>
    </div>
  );
}
