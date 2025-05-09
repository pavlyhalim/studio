"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { ErrorBoundary } from '@/components/error-boundary';
import { 
  getStudentCourses, 
  getAllActiveCourses, 
  getUpcomingAssignments, 
  getStudentGrades, 
  getStudentAnnouncements, 
  getStudentFiles, 
  enrollStudent, 
  getUserById
} from '@/lib/firebase-services';
import { 
  CourseRecord, 
  AssignmentRecord, 
  GradeRecord, 
  AnnouncementRecord, 
  FileRecord 
} from '@/lib/models';
import { PlusCircle, BookOpen, Clock, FileText, Award, Megaphone, Wand2, BarChart2, Download, Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StudyPlannerDialog } from './study-planner-dialog';
import { ProgressAnalyticsDialog } from './progress-analytics-dialog';

export function StudentDashboard() {
  const { user, userId } = useAuth();
  const { toast } = useToast();

  // State for data from Firebase
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [enrolledCourses, setEnrolledCourses] = useState<CourseRecord[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseRecord[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<AssignmentRecord[]>([]);
  const [allGrades, setAllGrades] = useState<GradeRecord[]>([]);
  const [recentGradesDisplay, setRecentGradesDisplay] = useState<GradeRecord[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [courseFiles, setCourseFiles] = useState<FileRecord[]>([]);
  
  // Enrollment state
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Memoize student's name from user object if available
  const studentName = useMemo(() => {
    return user?.name ?? 'Student';
  }, [user]);

  // Load student data from Firebase
  useEffect(() => {
    async function loadStudentData() {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Load enrolled courses
        const userCourses = await getStudentCourses(userId);
        setEnrolledCourses(userCourses);
        
        // Load available courses (filter out enrolled courses)
        const allCourses = await getAllActiveCourses();
        const enrolledCourseIds = userCourses.map(c => c.id);
        setAvailableCourses(allCourses.filter(c => !enrolledCourseIds.includes(c.id)));
        
        // Load upcoming assignments
        const assignments = await getUpcomingAssignments(userId, 14);
        setUpcomingAssignments(assignments);
        
        // Load all grades for the student
        const grades = await getStudentGrades(userId);
        setAllGrades(grades);
        
        // Set recent grades for dashboard display (sorted and sliced)
        const sortedGrades = [...grades].sort((a, b) => {
          const dateA = a.gradedDate instanceof Date ? a.gradedDate.getTime() : a.gradedDate as number;
          const dateB = b.gradedDate instanceof Date ? b.gradedDate.getTime() : b.gradedDate as number;
          return dateB - dateA;
        });
        setRecentGradesDisplay(sortedGrades.slice(0, 5));
        
        // Load recent announcements
        const announcements = await getStudentAnnouncements(userId, 5);
        setRecentAnnouncements(announcements);
        
        // Load course files
        const files = await getStudentFiles(userId);
        setCourseFiles(files);
        
      } catch (err) {
        console.error('Error loading student data:', err);
        setError('Failed to load your student data. Please try again.');
        toast({ 
          title: 'Data Loading Error', 
          description: 'There was an error loading your dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadStudentData();
  }, [userId, toast]);

  const handleEnroll = async (courseId: string) => {
    if (!userId) {
      toast({ 
        title: "Login Required", 
        description: "Please log in to enroll in courses.", 
        variant: "destructive" 
      });
      return;
    }

    setIsEnrolling(true);
    
    try {
      // Call the Firebase service to enroll the student
      await enrollStudent(userId, courseId);
      
      // Find the course in available courses
      const enrolledCourse = availableCourses.find(c => c.id === courseId);
      
      if (enrolledCourse) {
        // Update local state
        setEnrolledCourses(prev => [...prev, enrolledCourse]);
        setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
        
        toast({ 
          title: "Enrollment Successful", 
          description: `You have enrolled in "${enrolledCourse.title}"` 
        });
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast({ 
        title: "Enrollment Failed", 
        description: err instanceof Error ? err.message : "Failed to enroll in the course.", 
        variant: "destructive" 
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Get professor name by ID (cached)
  const professorCache = useMemo(() => new Map<string, string>(), []);
  
  const getProfessorName = async (profId: string | undefined): Promise<string> => {
    if (!profId) return 'N/A';
    
    // Check cache first
    if (professorCache.has(profId)) {
      return professorCache.get(profId) || 'Unknown Professor';
    }
    
    try {
      const professor = await getUserById(profId);
      const name = professor?.name || 'Unknown Professor';
      professorCache.set(profId, name);
      return name;
    } catch (err) {
      console.warn('Error fetching professor name:', err);
      return 'Unknown Professor';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="text-lg text-muted-foreground">
        <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Student Dashboard</h1>
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
                                      <ProfessorName professorId={course.professorId} />
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
                                          <ProfessorName professorId={course.professorId} />
                                      </CardContent>
                                      <CardFooter className="p-4 pt-0 flex justify-end">
                                          <Button
                                              size="sm"
                                              onClick={() => handleEnroll(course.id)}
                                              disabled={!userId || isEnrolling}
                                              variant="default"
                                              className="bg-accent hover:bg-accent/90"
                                              aria-label={`Enroll in ${course.title}`}
                                           >
                                               {isEnrolling ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                                              ) : (
                                                <><PlusCircle className="mr-2 h-4 w-4" /> Enroll</>
                                              )}
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
                                          const dueDate = assign.dueDate instanceof Date ? assign.dueDate : new Date(assign.dueDate as number);
                                          
                                          return (
                                              <li key={assign.id} className="text-sm p-3 border-l-4 border-destructive/70 rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors">
                                                  <p className="font-medium text-primary">{assign.title}</p>
                                                  <p className="text-xs text-muted-foreground">Course: {course?.title ?? 'N/A'}</p>
                                                  <p className="text-xs text-destructive/90">
                                                      Due: {format(dueDate, 'PPp')} ({formatDistanceToNow(dueDate, { addSuffix: true })})
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
                                       // Find the assignment
                                       const assignment = upcomingAssignments.find(a => a.id === grade.assignmentId) || {} as AssignmentRecord;
                                       const course = enrolledCourses.find(c => c.id === grade.courseId) || {} as CourseRecord;
                                       const maxScore = assignment?.maxScore ?? 100; // Fallback max score
                                       const percentage = maxScore > 0 ? Math.round((grade.score / maxScore) * 100) : 0;
                                       const scoreValid = maxScore > 0;
                                       const variant: "success" | "secondary" | "destructive" | "default" | "outline" | null | undefined = 
                                         scoreValid ? (percentage >= 80 ? "success" : percentage >= 60 ? "secondary" : "destructive") : "outline";
                                       
                                       // Convert timestamp to Date if needed
                                       const gradedDate = grade.gradedDate instanceof Date ? grade.gradedDate : new Date(grade.gradedDate as number);

                                      return (
                                           <li key={grade.id} className="text-sm p-3 border rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors">
                                              <div className="flex justify-between items-start gap-2">
                                                   <div className="flex-grow overflow-hidden">
                                                      <p className="font-medium text-primary truncate" title={assignment?.title ?? 'Unknown Assignment'}>
                                                          {assignment?.title ?? 'Unknown Assignment'}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground truncate" title={course?.title ?? 'N/A'}>Course: {course?.title ?? 'N/A'}</p>
                                                      <p className="text-xs text-muted-foreground">Graded: {format(gradedDate, 'PP')}</p>
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
                             assignments={upcomingAssignments}
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
                                          const course = enrolledCourses.find(c => c.id === ann.courseId) || {} as CourseRecord;
                                          // Convert timestamp to Date if needed
                                          const postedDate = ann.postedDate instanceof Date ? ann.postedDate : new Date(ann.postedDate as number);
                                          
                                          return (
                                               <li key={ann.id} className="text-sm p-3 border rounded bg-secondary/10 shadow-sm hover:bg-secondary/20 transition-colors">
                                                  <p className="font-semibold text-primary">{ann.title}</p>
                                                  <div className="text-xs text-muted-foreground mb-1 flex items-center flex-wrap gap-1">
                                                      <span>From: <ProfessorName professorId={ann.professorId} inline /></span>
                                                      <span className="mx-1">|</span>
                                                      <span>Course: {course?.title ?? 'N/A'}</span>
                                                      <span className="mx-1">|</span>
                                                      <span>{formatDistanceToNow(postedDate, { addSuffix: true })}</span>
                                                  </div>
                                                  <p className="whitespace-pre-wrap text-foreground/90">{ann.content}</p>
                                              </li>
                                          );
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
                                  const course = enrolledCourses.find(c => c.id === file.courseId) || {} as CourseRecord;
                                  // Convert timestamp to Date if needed
                                  const uploadDate = file.uploadDate instanceof Date ? file.uploadDate : new Date(file.uploadDate as number);
                                  
                                  return (
                                      <li key={file.id} className="flex items-center justify-between p-3 border rounded bg-background shadow-sm hover:bg-secondary/10 transition-colors text-sm group">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                              {file.fileType.startsWith('video/') ? <Video className="h-5 w-5 text-muted-foreground flex-shrink-0"/> : <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0"/>}
                                              <div className="flex-grow overflow-hidden">
                                                  <p className="font-medium text-primary truncate" title={file.fileName}>{file.fileName}</p>
                                                  <p className="text-xs text-muted-foreground truncate" title={course?.title ?? 'N/A'}>Course: {course?.title ?? 'N/A'}</p>
                                                  <p className="text-xs text-muted-foreground">Uploaded: {format(uploadDate, 'PP')}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                              <Badge variant="outline" className="text-xs">{file.sizeKB} KB</Badge>
                                              {/* Use 'a' tag for download/play with the storage URL */}
                                              <Button variant="outline" size="sm" asChild disabled={!file.storageRef} aria-label={`${file.fileType.startsWith('video/') ? 'Play' : 'Download'} file ${file.fileName}`}>
                                                  <a href={file.storageRef} target="_blank" rel="noopener noreferrer" download={!file.fileType.startsWith('video/') ? file.fileName : undefined}>
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
                       assignments={upcomingAssignments}
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
    </ErrorBoundary>
  );
}

// Helper component to handle async professor name fetching
function ProfessorName({ professorId, inline = false }: { professorId: string, inline?: boolean }) {
  const [name, setName] = useState<string>('Loading...');
  
  useEffect(() => {
    async function fetchProfessorName() {
      try {
        const professor = await getUserById(professorId);
        setName(professor?.name || 'Unknown Professor');
      } catch (error) {
        console.error('Error fetching professor name:', error);
        setName('Unknown Professor');
      }
    }
    
    fetchProfessorName();
  }, [professorId]);
  
  if (inline) return <span>{name}</span>;
  
  return <p className="text-xs text-muted-foreground mt-1">Professor: {name}</p>;
}

// Import missing components
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";