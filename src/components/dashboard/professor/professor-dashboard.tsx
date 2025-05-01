"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Upload, PlusCircle, Download, Edit, Trash2, Send, FileText, Video, BarChart2 } from 'lucide-react'; // Added icons
import { reviewAIResponse, ReviewAIResponseInput } from '@/ai/flows/professor-review-ai-responses'; // Import Genkit flow
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
    sampleCourses,
    getCoursesByProfessor,
    getFilesByProfessor,
    getAnnouncementsForProfessor,
    addSampleAnnouncement,
    addSampleFile,
    sampleAssignments, // Import assignments
    sampleGrades, // Import grades
    getStudentsInCourse, // Import student getter
    sampleUsers, // Import sampleUsers
    type Course,
    type UploadedFile,
    type Announcement,
    type Assignment,
    type Grade,
    type User
} from '@/lib/sample-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns'; // For date formatting
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For course selection
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // For grades

export function ProfessorDashboard() {
  const { userId } = useAuth(); // Get sample professor userId
  const { toast } = useToast();

  // AI Review State
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [courseMaterial, setCourseMaterial] = useState('');
  const [reviewResult, setReviewResult] = useState<any>(null); // TODO: Use ReviewAIResponseOutput type
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadCourseId, setUploadCourseId] = useState<string>(''); // Course to upload file to

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementCourseId, setAnnouncementCourseId] = useState<string>('');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Course & Data State
  const [professorCourses, setProfessorCourses] = useState<Course[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]); // State for assignments
  const [grades, setGrades] = useState<Grade[]>([]); // State for grades
  const [students, setStudents] = useState<User[]>([]); // State for students in selected course

  // Selected Course for Management View
  const [selectedCourseManageId, setSelectedCourseManageId] = useState<string | null>(null);

   useEffect(() => {
    if (userId) {
        // Use the helper function to get courses for the current professor
        const courses = getCoursesByProfessor(userId);
        setProfessorCourses(courses);
        // Load initial files and announcements for the professor
        setUploadedFiles(getFilesByProfessor(userId));
        setAnnouncements(getAnnouncementsForProfessor(userId));

        // Set default course IDs for selectors if courses exist
        if (courses.length > 0) {
            setUploadCourseId(courses[0].id);
            setAnnouncementCourseId(courses[0].id);
            // Automatically select the first course for management view
            setSelectedCourseManageId(courses[0].id);
        }

    } else {
        setProfessorCourses([]);
        setUploadedFiles([]);
        setAnnouncements([]);
        setUploadCourseId('');
        setAnnouncementCourseId('');
        setSelectedCourseManageId(null);
    }
   }, [userId]);

   // Effect to load data when selected course for management changes
   useEffect(() => {
        if(selectedCourseManageId) {
            // Load assignments, grades, and students for the selected course
            // In a real app, these would be fetched based on the ID
            setAssignments(sampleAssignments.filter(a => a.courseId === selectedCourseManageId));
            setGrades(sampleGrades.filter(g => g.courseId === selectedCourseManageId));
            setStudents(getStudentsInCourse(selectedCourseManageId));
        } else {
            setAssignments([]);
            setGrades([]);
            setStudents([]);
        }
   }, [selectedCourseManageId]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !aiResponse || !courseMaterial) {
      toast({ title: "Missing Information", description: "Please fill in all fields for the review.", variant: "destructive" });
      return;
    }
    setIsReviewing(true);
    setReviewError(null);
    setReviewResult(null);
    try {
      const input: ReviewAIResponseInput = { question, aiResponse, courseMaterial };
      const result = await reviewAIResponse(input);
      setReviewResult(result);
      toast({ title: "Review Complete", description: "AI analysis of the response is finished." });
    } catch (error) {
      console.error("AI Review Error:", error);
      setReviewError("Failed to review the AI response. Please try again.");
      toast({ title: "Review Failed", description: "An error occurred during the AI review.", variant: "destructive" });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    // Use the selected course ID for management when uploading from that section
    const targetCourseId = selectedCourseManageId || uploadCourseId;
    if (!targetCourseId) {
      setUploadError("Please select a course to upload the file to.");
      return;
    }
    if (!userId) {
      setUploadError("Authentication error. Please log in again.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2; // Simulate success/failure

    if (success) {
        const newFileData: Omit<UploadedFile, 'id' | 'uploadDate'> = {
            courseId: targetCourseId, // Use the correct course ID
            professorId: userId,
            fileName: selectedFile.name,
            fileType: selectedFile.type || 'unknown', // Handle unknown type
            url: '#', // Placeholder URL
            sizeKB: Math.round(selectedFile.size / 1024),
        };
        const addedFile = addSampleFile(newFileData); // Simulate adding to data
        setUploadedFiles(prev => [addedFile, ...prev].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())); // Update state and sort


        setUploadSuccess(`File "${selectedFile.name}" uploaded to course "${sampleCourses.find(c => c.id === targetCourseId)?.title}" (simulated).`);
        toast({ title: "Upload Successful", description: `File "${selectedFile.name}" uploaded.` });
        setSelectedFile(null); // Reset file input state
        // Clear both possible file inputs visually
        const fileInputManage = document.getElementById('file-upload-manage') as HTMLInputElement;
        if (fileInputManage) fileInputManage.value = '';
        const fileInputGlobal = document.getElementById('file-upload-global') as HTMLInputElement; // If you add a global one later
        if (fileInputGlobal) fileInputGlobal.value = '';

    } else {
        setUploadError("File upload failed (simulated). Please try again.");
        toast({ title: "Upload Failed", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use the selected course ID for management when posting from that section
    const targetCourseId = selectedCourseManageId || announcementCourseId;
    if (!announcementTitle || !announcementContent || !targetCourseId) {
        toast({ title: "Missing Information", description: "Please provide title, content, and ensure a course is selected.", variant: "destructive"});
        return;
    }
    if (!userId) {
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive"});
      return;
    }

    setIsPostingAnnouncement(true);
    // Simulate posting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAnnouncementData: Omit<Announcement, 'id' | 'postedDate'> = {
        courseId: targetCourseId, // Use the correct course ID
        title: announcementTitle,
        content: announcementContent,
        professorId: userId,
    };
    const addedAnnouncement = addSampleAnnouncement(newAnnouncementData); // Simulate adding
    // Update state and sort by date descending
    setAnnouncements(prev => [addedAnnouncement, ...prev].sort((a,b) => b.postedDate.getTime() - a.postedDate.getTime()));

    toast({ title: "Announcement Posted", description: `Posted "${announcementTitle}" to ${sampleCourses.find(c=>c.id === targetCourseId)?.title}`});
    // Reset form
    setAnnouncementTitle('');
    setAnnouncementContent('');
    // Keep selected course ID
    setIsPostingAnnouncement(false);
  };

  // Handle clicking on a course to manage it
  const handleManageCourse = (courseId: string) => {
    setSelectedCourseManageId(courseId);
     // Optionally scroll to the management section
     document.getElementById('course-management-section')?.scrollIntoView({ behavior: 'smooth' });
  };

   // Simulate deleting a file
   const handleDeleteFile = (fileId: string) => {
        setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
        toast({ title: "File Deleted", description: "File removed (simulated)." });
   };

   // Get selected course details
   const selectedCourseForManagement = professorCourses.find(c => c.id === selectedCourseManageId);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Professor Dashboard</h1>
      <p className="text-lg text-muted-foreground">Welcome, {userId ? sampleUsers.find(u=>u.id===userId)?.name : 'Professor'}!</p>

      {/* My Courses Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Overview of the courses you are teaching. Click 'Manage' to see details below.</CardDescription>
        </CardHeader>
        <CardContent>
          {professorCourses.length > 0 ? (
            <ScrollArea className="h-48">
              <ul className="space-y-3">
                {professorCourses.map(course => (
                  <li key={course.id} className={`p-3 border rounded-md shadow-sm flex justify-between items-center ${selectedCourseManageId === course.id ? 'bg-accent/20 border-accent' : 'bg-secondary/10 hover:bg-secondary/20 transition-colors'}`}>
                    <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                     <Button
                        variant={selectedCourseManageId === course.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleManageCourse(course.id)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 data-[variant=outline]:bg-background data-[variant=outline]:text-foreground" // Ensure proper styling
                    >
                       {selectedCourseManageId === course.id ? "Managing" : "Manage"}
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">You are not assigned to any courses.</p>
          )}
        </CardContent>
      </Card>

       {/* Detailed Course Management Section - Only shown when a course is selected */}
        {selectedCourseForManagement && (
            <Card id="course-management-section" className="border-accent shadow-md">
                <CardHeader className="bg-accent/10 rounded-t-lg">
                    <CardTitle>Manage Course: {selectedCourseForManagement.title}</CardTitle>
                     <CardDescription>Manage announcements, files, assignments, and grades for this course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                     {/* Announcements for Selected Course */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Announcements for {selectedCourseForManagement.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePostAnnouncement} className="space-y-3 mb-4 p-3 border rounded-md bg-secondary/10">
                                 <Input
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    placeholder="Announcement Title"
                                    required
                                 />
                                 <Textarea
                                     value={announcementContent}
                                     onChange={(e) => setAnnouncementContent(e.target.value)}
                                     placeholder="Announcement Content..."
                                     required
                                     rows={3}
                                 />
                                 <Button type="submit" disabled={isPostingAnnouncement} className="w-full bg-accent hover:bg-accent/90">
                                     {isPostingAnnouncement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                     Post Announcement
                                 </Button>
                            </form>
                             <ScrollArea className="h-40 border rounded-md p-2">
                                {announcements.filter(a => a.courseId === selectedCourseManageId).length > 0 ? (
                                    <ul className="space-y-2">
                                        {announcements.filter(a => a.courseId === selectedCourseManageId).map(ann => (
                                            <li key={ann.id} className="text-sm p-2 bg-background rounded border border-border">
                                                <p className="font-semibold">{ann.title}</p>
                                                <p className="text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                                                <p className="text-xs text-muted-foreground/70 mt-1">{format(ann.postedDate, 'PPp')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No announcements for this course yet.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Files for Selected Course */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Files for {selectedCourseForManagement.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4 p-3 border rounded-md bg-secondary/10 space-y-3">
                                <Label htmlFor="file-upload-manage">Upload New File to this Course</Label>
                                <Input
                                    id="file-upload-manage" // Unique ID
                                    type="file"
                                    onChange={handleFileChange} // Reuse handler
                                    disabled={isUploading}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                />
                                {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>}
                                {uploadError && <Alert variant="destructive" className="text-xs"><AlertDescription>{uploadError}</AlertDescription></Alert>}
                                {uploadSuccess && <Alert variant="success" className="text-xs"><AlertDescription>{uploadSuccess}</AlertDescription></Alert>}
                                <Button onClick={handleFileUpload} disabled={isUploading || !selectedFile} className="w-full bg-accent hover:bg-accent/90">
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    {isUploading ? 'Uploading...' : 'Upload File'}
                                </Button>
                            </div>

                             <ScrollArea className="h-48 border rounded-md p-2">
                                {uploadedFiles.filter(f => f.courseId === selectedCourseManageId).length > 0 ? (
                                    <ul className="space-y-2">
                                        {uploadedFiles.filter(f => f.courseId === selectedCourseManageId).map(file => (
                                            <li key={file.id} className="flex items-center justify-between p-2 bg-background rounded border border-border text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                     {file.fileType.startsWith('video/') ? <Video className="h-4 w-4 text-muted-foreground flex-shrink-0"/> : <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0"/>}
                                                    <span className="truncate flex-grow">{file.fileName}</span>
                                                    <Badge variant="outline" className="text-xs flex-shrink-0">{file.sizeKB} KB</Badge>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {/* Video Player or Download */}
                                                    {file.fileType.startsWith('video/') ? (
                                                        <Button variant="outline" size="sm" asChild disabled={file.url === '#'}>
                                                             <a href={file.url} target="_blank" rel="noopener noreferrer">Play</a>
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm" asChild disabled={file.url === '#'}>
                                                            <a href={file.url} download={file.fileName}>Download</a>
                                                        </Button>
                                                    )}

                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => handleDeleteFile(file.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                     </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                     <p className="text-sm text-muted-foreground text-center py-4">No files uploaded for this course yet.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                     {/* Assignments & Grades Section */}
                     <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Assignments & Grades for {selectedCourseForManagement.title}</CardTitle>
                            <CardDescription>View assignments and student grades for this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {/* TODO: Add Assignment Creation Form */}
                           <Button variant="outline" className="mb-4 w-full" disabled><PlusCircle className="mr-2 h-4 w-4"/> Create New Assignment (Not Implemented)</Button>

                            <h4 className="font-semibold mb-2">Current Assignments</h4>
                            <ScrollArea className="h-40 border rounded-md p-2 mb-6">
                                {assignments.length > 0 ? (
                                    <ul className="space-y-2">
                                        {assignments.map(assign => (
                                            <li key={assign.id} className="text-sm p-2 bg-background rounded border border-border">
                                                <div className="flex justify-between items-start">
                                                     <div>
                                                        <p className="font-medium">{assign.title}</p>
                                                        <p className="text-xs text-muted-foreground">Due: {format(assign.dueDate, 'PP')}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" disabled>View/Edit</Button>
                                                </div>
                                                 <p className="text-xs text-muted-foreground mt-1">{assign.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No assignments created for this course yet.</p>
                                )}
                            </ScrollArea>

                            <h4 className="font-semibold mb-2">Student Grades</h4>
                            <ScrollArea className="h-60 border rounded-md">
                                {grades.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Assignment</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {grades.map(grade => {
                                                const student = students.find(s => s.id === grade.studentId);
                                                const assignment = assignments.find(a => a.id === grade.assignmentId);
                                                const percentage = grade.maxScore > 0 ? ((grade.score / grade.maxScore) * 100).toFixed(0) : 'N/A';
                                                const scoreColor = parseInt(percentage) >= 80 ? "text-success" : parseInt(percentage) >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-destructive";

                                                return (
                                                    <TableRow key={grade.id}>
                                                        <TableCell>{student?.name ?? 'Unknown Student'}</TableCell>
                                                        <TableCell className="truncate max-w-[200px]">{assignment?.title ?? 'Unknown Assignment'}</TableCell>
                                                        <TableCell className={`text-right font-medium ${scoreColor}`}>{grade.score}/{grade.maxScore}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="outline" size="sm" disabled>Edit Grade</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">No grades recorded for this course yet.</p>
                                )}
                             </ScrollArea>
                        </CardContent>
                    </Card>

                </CardContent>
                 <CardFooter className="border-t p-4 bg-secondary/10 rounded-b-lg">
                    <p className="text-xs text-muted-foreground">Currently managing "{selectedCourseForManagement.title}". Select another course above to switch.</p>
                 </CardFooter>
            </Card>
        )}

        {/* Conditionally render message if no course is selected for management */}
        {!selectedCourseForManagement && professorCourses.length > 0 && (
             <Card className="border-dashed border-primary/50">
                <CardHeader>
                    <CardTitle>Select a Course</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Click the "Manage" button on a course in the "My Courses" section above to view and manage its details here.</p>
                </CardContent>
             </Card>
        )}


      {/* AI Response Review Section */}
      <Card>
        <CardHeader>
          <CardTitle>Review AI Responses</CardTitle>
          <CardDescription>Analyze the accuracy and relevance of AI answers using course context.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Student Question</Label>
              <Textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the student's question..." required />
            </div>
            <div>
              <Label htmlFor="aiResponse">AI Response</Label>
              <Textarea id="aiResponse" value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} placeholder="Enter the AI's response..." required />
            </div>
            <div>
              <Label htmlFor="courseMaterial">Relevant Course Material / Context</Label>
              <Textarea id="courseMaterial" value={courseMaterial} onChange={(e) => setCourseMaterial(e.target.value)} placeholder="Paste relevant course material, lecture notes, or context..." required rows={5} />
            </div>
            {reviewError && (
                 <Alert variant="destructive">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertTitle>Review Error</AlertTitle>
                   <AlertDescription>{reviewError}</AlertDescription>
                 </Alert>
             )}
            <Button type="submit" disabled={isReviewing} className="w-full bg-accent hover:bg-accent/90">
              {isReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Review Response with AI
            </Button>
          </form>

          {isReviewing && (
            <div className="mt-4 space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
            </div>
           )}

          {reviewResult && !isReviewing && (
            <div className="mt-6 space-y-3 rounded-md border p-4 bg-secondary/30">
               <h3 className="text-lg font-semibold text-primary">Review Results:</h3>
               <p><Badge variant={reviewResult.isAccurate ? "success" : "destructive"}>{reviewResult.isAccurate ? 'Accurate' : 'Inaccurate'}</Badge></p>
               <p><Badge variant={reviewResult.isRelevant ? "success" : "destructive"}>{reviewResult.isRelevant ? 'Relevant' : 'Not Relevant'}</Badge></p>
               <p><strong>Feedback:</strong> {reviewResult.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other placeholder widgets */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Analytics</CardTitle>
                 <CardDescription>Track overall student activity and performance.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center justify-center text-muted-foreground h-32">
                    <BarChart2 className="h-8 w-8 mr-2" /> Placeholder for Engagement Chart/Data
                </div>
                {/* TODO: Display engagement analytics */}
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                     <CardDescription>Common professor tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                     <Button variant="outline" disabled>Grade Submissions</Button>
                     <Button variant="outline" disabled>View Discussion Forums</Button>
                     <Button variant="outline" disabled>Schedule Office Hours</Button>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}

// Helper component for success badge (or integrate into main Badge component later)
const SuccessBadge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {children}
    </span>
);

const DestructiveBadge = ({ children }: { children: React.ReactNode }) => (
     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        {children}
    </span>
);
