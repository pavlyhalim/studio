// src/components/dashboard/professor/professor-dashboard.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Upload, PlusCircle, Download, Edit, Trash2, Send, FileText, Video, BarChart2 } from 'lucide-react';
import { reviewAIResponse, ReviewAIResponseInput, ReviewAIResponseOutput } from '@/ai/flows/professor-review-ai-responses';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
    getCoursesByProfessor,
    getEnrolledStudents,
    getCourseAssignments,
    getAssignmentGrades,
    getCourseAnnouncements,
    getCourseFiles,
    createAnnouncement,
    uploadFile,
    deleteFile,
    deleteAnnouncement,
    getUserById,
    createAssignment,
    submitGrade
} from '@/lib/firebase-services';
import { 
    CourseRecord,
    UserRecord,
    EnrollmentRecord,
    AssignmentRecord,
    GradeRecord,
    AnnouncementRecord,
    FileRecord 
} from '@/lib/models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define SimpleUser type without password hash for client-side state
type SimpleUser = Omit<UserRecord, 'passwordHash'>;

export function ProfessorDashboard() {
  const { userId, user } = useAuth(); // Get user object as well
  const { toast } = useToast();

  // AI Review State
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [courseMaterial, setCourseMaterial] = useState('');
  const [reviewResult, setReviewResult] = useState<ReviewAIResponseOutput | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Course & Data State
  const [loading, setLoading] = useState(true);
  const [professorCourses, setProfessorCourses] = useState<CourseRecord[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [students, setStudents] = useState<SimpleUser[]>([]);

  // Selected Course for Management View
  const [selectedCourseManageId, setSelectedCourseManageId] = useState<string | null>(null);

  // Memoize professor's name from user object if available
  const professorName = useMemo(() => {
    return user?.name ?? 'Professor'; // Use logged-in user's name or default
  }, [user]);

  // Effect to initialize professor's courses
  useEffect(() => {
    const loadProfessorData = async () => {
      if (!userId) {
        setProfessorCourses([]);
        setSelectedCourseManageId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch professor's courses from Firebase
        const courses = await getCoursesByProfessor(userId);
        setProfessorCourses(courses);

        // Automatically select the first course for management view if available and none selected
        if (courses.length > 0 && !selectedCourseManageId) {
          setSelectedCourseManageId(courses[0].id);
        } else if (courses.length === 0) {
          setSelectedCourseManageId(null);
        }
      } catch (error) {
        console.error("Error loading professor data:", error);
        toast({ 
          title: "Loading Error", 
          description: "Failed to load professor data. Please try again.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfessorData();
  }, [userId, toast]);

  // Effect to load detailed data when selected course for management changes
  useEffect(() => {
    const loadCourseData = async () => {
      if (!selectedCourseManageId) {
        setAssignments([]);
        setGrades([]);
        setStudents([]);
        setAnnouncements([]);
        setUploadedFiles([]);
        return;
      }

      try {
        setLoading(true);
        
        // Load data in parallel
        const [
          courseAssignments,
          courseStudents,
          courseAnnouncements,
          courseFiles
        ] = await Promise.all([
          getCourseAssignments(selectedCourseManageId),
          getEnrolledStudents(selectedCourseManageId),
          getCourseAnnouncements(selectedCourseManageId),
          getCourseFiles(selectedCourseManageId)
        ]);

        setAssignments(courseAssignments);
        setStudents(courseStudents);
        setAnnouncements(courseAnnouncements);
        setUploadedFiles(courseFiles);

        // Fetch grades for all assignments in this course
        const allGrades: GradeRecord[] = [];
        for (const assignment of courseAssignments) {
          const assignmentGrades = await getAssignmentGrades(assignment.id);
          allGrades.push(...assignmentGrades);
        }
        setGrades(allGrades);

      } catch (error) {
        console.error("Error loading course data:", error);
        toast({
          title: "Loading Error",
          description: "Failed to load course data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [selectedCourseManageId, toast]);

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
    const targetCourseId = selectedCourseManageId;
    if (!targetCourseId) {
      setUploadError("No course selected to upload the file to.");
      toast({title: "No Course Selected", description:"Please select a course to manage first.", variant:"destructive"});
      return;
    }
    if (!userId) {
      setUploadError("Authentication error. Please log in again.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Upload the file to Firebase storage and create Firestore record
      const newFile = await uploadFile(
        selectedFile,
        targetCourseId,
        userId,
        'course' // Default access level
      );

      // Update local state with the new file
      setUploadedFiles(prev => [newFile, ...prev]);

      const courseTitle = professorCourses.find(c => c.id === targetCourseId)?.title ?? 'the course';
      setUploadSuccess(`File "${selectedFile.name}" uploaded to course "${courseTitle}".`);
      toast({ title: "Upload Successful", description: `File "${selectedFile.name}" uploaded.` });
      setSelectedFile(null); // Reset file input state

      // Clear the specific file input visually
      const fileInputManage = document.getElementById('file-upload-manage') as HTMLInputElement;
      if (fileInputManage) fileInputManage.value = '';

    } catch (error) {
      console.error("File Upload Error:", error);
      setUploadError("File upload failed. Please try again.");
      toast({ title: "Upload Failed", variant: "destructive" });
    }

    setIsUploading(false);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourseId = selectedCourseManageId;
    if (!announcementTitle || !announcementContent || !targetCourseId) {
        toast({ title: "Missing Information", description: "Please provide title, content, and ensure a course is selected.", variant: "destructive"});
        return;
    }
    if (!userId) {
      toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive"});
      return;
    }

    setIsPostingAnnouncement(true);

    try {
      // Create the announcement in Firebase
      const newAnnouncement = await createAnnouncement({
        courseId: targetCourseId,
        title: announcementTitle,
        content: announcementContent,
        professorId: userId,
      });

      // Update local state with the new announcement
      setAnnouncements(prev => [newAnnouncement, ...prev]);

      const courseTitle = professorCourses.find(c => c.id === targetCourseId)?.title ?? 'the course';
      toast({ title: "Announcement Posted", description: `Posted "${announcementTitle}" to ${courseTitle}`});
      
      // Reset form
      setAnnouncementTitle('');
      setAnnouncementContent('');
    } catch (error) {
      console.error("Announcement Post Error:", error);
      toast({ title: "Post Failed", description: "Could not post announcement.", variant: "destructive" });
    }

    setIsPostingAnnouncement(false);
  };

  // Handle clicking on a course to manage it
  const handleManageCourse = (courseId: string) => {
    setSelectedCourseManageId(courseId);
    // Optionally scroll to the management section
    document.getElementById('course-management-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Delete a file
  const handleDeleteFile = async (fileId: string) => {
    const fileToDelete = uploadedFiles.find(f => f.id === fileId);
    if (!fileToDelete) return;

    try {
      // Delete the file from Firebase
      await deleteFile(fileId);

      // Update local state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast({ title: "File Deleted", description: `File "${fileToDelete.fileName}" removed.` });
    } catch (error) {
      console.error("File Deletion Error:", error);
      toast({ 
        title: "Deletion Failed", 
        description: `Could not delete file "${fileToDelete.fileName}".`, 
        variant: "destructive"
      });
    }
  };

  // Delete an announcement
  const handleDeleteAnnouncement = async (announcementId: string) => {
    const announcementToDelete = announcements.find(a => a.id === announcementId);
    if (!announcementToDelete) return;

    try {
      // Delete the announcement from Firebase
      await deleteAnnouncement(announcementId);

      // Update local state
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      toast({ title: "Announcement Deleted", description: `Announcement "${announcementToDelete.title}" removed.` });
    } catch (error) {
      console.error("Announcement Deletion Error:", error);
      toast({ 
        title: "Deletion Failed", 
        description: `Could not delete announcement "${announcementToDelete.title}".`, 
        variant: "destructive"
      });
    }
  };

  // Get selected course details for display
  const selectedCourseForManagement = professorCourses.find(c => c.id === selectedCourseManageId);

  // Loading state
  if (loading && !professorCourses.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Professor Dashboard</h1>
        <p className="text-lg text-muted-foreground">Loading your data...</p>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Professor Dashboard</h1>
      <p className="text-lg text-muted-foreground">Welcome, {professorName}!</p>

      {/* My Courses Overview Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Overview of the courses you are teaching. Click 'Manage' to see details below.</CardDescription>
        </CardHeader>
        <CardContent>
          {professorCourses.length > 0 ? (
            <ScrollArea className="h-48 pr-3">
              <ul className="space-y-3">
                {professorCourses.map(course => (
                  <li key={course.id} className={`p-3 border rounded-md shadow-sm flex justify-between items-center transition-colors ${selectedCourseManageId === course.id ? 'bg-accent/20 border-accent' : 'bg-secondary/10 hover:bg-secondary/20'}`}>
                    <div>
                        <h3 className="font-semibold text-primary">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                     <Button
                        variant={selectedCourseManageId === course.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleManageCourse(course.id)}
                        className={`${selectedCourseManageId === course.id ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'bg-background text-foreground'} `}
                    >
                       {selectedCourseManageId === course.id ? "Managing" : "Manage"}
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">You are not assigned to any courses.</p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Course Management Section */}
      {selectedCourseForManagement ? (
        <Card id="course-management-section" className="border-accent shadow-lg">
          <CardHeader className="bg-accent/10 rounded-t-lg border-b border-accent/20">
            <CardTitle className="text-xl text-accent">{selectedCourseForManagement.title}</CardTitle>
            <CardDescription>Manage announcements, files, assignments, and grades for this course.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Left Column: Announcements & Files */}
            <div className="space-y-6">
              {/* Announcements for Selected Course */}
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="bg-secondary/10">
                  <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handlePostAnnouncement} className="space-y-3 mb-4 p-3 border rounded-md bg-background">
                    <Input 
                      value={announcementTitle} 
                      onChange={(e) => setAnnouncementTitle(e.target.value)} 
                      placeholder="Announcement Title" 
                      required 
                      aria-label="New announcement title"
                    />
                    <Textarea 
                      value={announcementContent} 
                      onChange={(e) => setAnnouncementContent(e.target.value)} 
                      placeholder="Announcement Content..." 
                      required 
                      rows={3} 
                      aria-label="New announcement content"
                    />
                    <Button 
                      type="submit" 
                      disabled={isPostingAnnouncement} 
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      {isPostingAnnouncement ? 
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                        <Send className="mr-2 h-4 w-4" />
                      } 
                      Post Announcement
                    </Button>
                  </form>
                  <ScrollArea className="h-40 border rounded-md p-2 bg-secondary/5">
                    {announcements.length > 0 ? (
                      <ul className="space-y-2">
                        {announcements.map(ann => (
                          <li key={ann.id} className="text-sm p-3 bg-background rounded border border-border flex justify-between items-start group shadow-sm">
                            <div className="flex-grow overflow-hidden">
                              <p className="font-semibold text-primary truncate" title={ann.title}>{ann.title}</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                Posted: {formatDistanceToNow(
                                  ann.postedDate instanceof Date ? 
                                    ann.postedDate : 
                                    new Date(ann.postedDate as number), 
                                  { addSuffix: true }
                                )}
                              </p>
                              <p className="text-muted-foreground whitespace-pre-wrap mt-1">{ann.content}</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 h-7 w-7 ml-2 flex-shrink-0" 
                                  aria-label={`Delete announcement ${ann.title}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete the announcement "{ann.title}"? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteAnnouncement(ann.id)} 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="bg-secondary/10">
                  <CardTitle className="text-lg font-semibold">Files</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 p-3 border rounded-md bg-background space-y-3">
                    <Label htmlFor="file-upload-manage" className="font-medium">Upload New File</Label>
                    <Input 
                      id="file-upload-manage" 
                      type="file" 
                      onChange={handleFileChange} 
                      disabled={isUploading} 
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                      aria-label="Upload new file"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    {uploadError && (
                      <Alert variant="destructive" className="text-xs">
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                    {uploadSuccess && (
                      <Alert variant="success" className="text-xs">
                        <AlertDescription>{uploadSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={handleFileUpload} 
                      disabled={isUploading || !selectedFile} 
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      {isUploading ? 
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                        <Upload className="mr-2 h-4 w-4" />
                      } 
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                  <ScrollArea className="h-48 border rounded-md p-2 bg-secondary/5">
                    {uploadedFiles.length > 0 ? (
                      <ul className="space-y-2">
                        {uploadedFiles.map(file => (
                          <li key={file.id} className="flex items-center justify-between p-3 bg-background rounded border border-border text-sm group shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {file.fileType.startsWith('video/') ? 
                                <Video className="h-5 w-5 text-muted-foreground flex-shrink-0"/> : 
                                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                              }
                              <div className="flex-grow overflow-hidden">
                                <p className="font-medium text-primary truncate" title={file.fileName}>{file.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {format(
                                    file.uploadDate instanceof Date ? 
                                      file.uploadDate : 
                                      new Date(file.uploadDate as number), 
                                    'PP'
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">{file.sizeKB} KB</Badge>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild 
                                disabled={!file.storageRef} 
                                aria-label={`${file.fileType.startsWith('video/') ? 'Play' : 'Download'} file ${file.fileName}`}
                              >
                                <a 
                                  href={file.storageRef} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  download={!file.fileType.startsWith('video/') ? file.fileName : undefined}
                                >
                                  <Download className="mr-1 h-3 w-3" /> 
                                  {file.fileType.startsWith('video/') ? 'Play' : 'Download'}
                                </a>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 h-8 w-8" 
                                    aria-label={`Delete file ${file.fileName}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete File?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the file "{file.fileName}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteFile(file.id)} 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
            </div>

            {/* Right Column: Assignments & Grades */}
            <div className="space-y-6">
              {/* Assignments & Grades Section */}
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="bg-secondary/10">
                  <CardTitle className="text-lg font-semibold">Assignments & Grades</CardTitle>
                  <CardDescription>View assignments and student grades for this course.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button 
                    variant="outline" 
                    className="mb-4 w-full border-dashed border-accent text-accent hover:bg-accent/10" 
                    disabled
                  >
                    <PlusCircle className="mr-2 h-4 w-4"/> Create New Assignment (Feature Coming Soon)
                  </Button>

                  <h4 className="font-semibold mb-2">Current Assignments ({assignments.length})</h4>
                  <ScrollArea className="h-40 border rounded-md p-2 mb-6 bg-secondary/5">
                    {assignments.length > 0 ? (
                      <ul className="space-y-2">
                        {assignments.map(assign => {
                          // Convert dueDate to Date if needed
                          const dueDate = assign.dueDate instanceof Date ? 
                            assign.dueDate : 
                            new Date(assign.dueDate as number);
                            
                          return (
                            <li key={assign.id} className="text-sm p-3 bg-background rounded border border-border shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-medium text-primary truncate" title={assign.title}>
                                    {assign.title} 
                                    <Badge variant="secondary" className="ml-1 text-xs">Max: {assign.maxScore}</Badge>
                                  </p>
                                  <p className="text-xs text-destructive/90">
                                    Due: {format(dueDate, 'PPp')} ({formatDistanceToNow(dueDate, { addSuffix: true })})
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 truncate" title={assign.description}>
                                    {assign.description}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" disabled className="ml-2 flex-shrink-0">View/Edit</Button>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No assignments created yet.</p>
                    )}
                  </ScrollArea>

                  <h4 className="font-semibold mb-2">Student Grades ({grades.length})</h4>
                  <ScrollArea className="h-60 border rounded-md bg-secondary/5">
                    {grades.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Assignment</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grades.map(grade => {
                            const student = students.find(s => s.id === grade.studentId);
                            const assignment = assignments.find(a => a.id === grade.assignmentId);
                            const maxScore = assignment?.maxScore ?? 0;
                            const percentage = maxScore > 0 ? Math.round((grade.score / maxScore) * 100) : 0;
                            const scoreValid = maxScore > 0;
                            const scoreColor = scoreValid ? 
                              (percentage >= 80 ? "text-green-600 dark:text-green-400" : 
                               percentage >= 60 ? "text-yellow-600 dark:text-yellow-400" : 
                               "text-red-600 dark:text-red-400") : 
                              "text-muted-foreground";

                            return (
                              <TableRow key={grade.id} className="hover:bg-muted/20">
                                <TableCell className="font-medium text-primary/90">{student?.name ?? 'Unknown Student'}</TableCell>
                                <TableCell className="truncate max-w-[150px] md:max-w-[200px]" title={assignment?.title ?? 'Unknown'}>
                                  {assignment?.title ?? 'Unknown'}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${scoreColor}`}>
                                  {scoreValid ? `${grade.score}/${maxScore} (${percentage}%)` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm" disabled>
                                    <Edit className="mr-1 h-3 w-3" /> Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center p-4">No grades recorded yet.</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4 bg-secondary/10 rounded-b-lg">
            <p className="text-xs text-muted-foreground">
              Currently managing "{selectedCourseForManagement.title}". Select another course above to switch.
            </p>
          </CardFooter>
        </Card>
      ) : professorCourses.length > 0 ? (
        <Card className="border-dashed border-primary/50 shadow-sm">
          <CardHeader><CardTitle>Select a Course to Manage</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Click the "Manage" button on a course in the "My Courses" section above to view and manage its details here (Announcements, Files, Grades, etc.).
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* AI Response Review Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Review AI Responses</CardTitle>
          <CardDescription>Analyze the accuracy and relevance of AI answers using course context.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Student Question</Label>
              <Textarea 
                id="question" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="Enter the student's question..." 
                required 
                aria-label="Student question input"
              />
            </div>
            <div>
              <Label htmlFor="aiResponse">AI Response</Label>
              <Textarea 
                id="aiResponse" 
                value={aiResponse} 
                onChange={(e) => setAiResponse(e.target.value)} 
                placeholder="Enter the AI's response..." 
                required 
                aria-label="AI response input" 
              />
            </div>
            <div>
              <Label htmlFor="courseMaterial">Relevant Course Material / Context</Label>
              <Textarea 
                id="courseMaterial" 
                value={courseMaterial} 
                onChange={(e) => setCourseMaterial(e.target.value)} 
                placeholder="Paste relevant course material, lecture notes, or context..." 
                required 
                rows={5} 
                aria-label="Relevant course material input"
              />
            </div>
            {reviewError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Review Error</AlertTitle>
                <AlertDescription>{reviewError}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              disabled={isReviewing} 
              className="w-full bg-accent hover:bg-accent/90"
            >
              {isReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isReviewing ? 'Reviewing...' : 'Review Response with AI'}
            </Button>
          </form>
          {isReviewing && (
            <div className="mt-4 space-y-2" aria-live="polite">
              <p className="text-sm text-muted-foreground">Analyzing response...</p>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {reviewResult && !isReviewing && (
            <div className="mt-6 space-y-3 rounded-md border p-4 bg-secondary/30" aria-live="polite">
              <h3 className="text-lg font-semibold text-primary">Review Results:</h3>
              <p>
                Accuracy: 
                <Badge variant={reviewResult.isAccurate ? "success" : "destructive"}>
                  {reviewResult.isAccurate ? 'Accurate' : 'Inaccurate'}
                </Badge>
              </p>
              <p>
                Relevance: 
                <Badge variant={reviewResult.isRelevant ? "success" : "destructive"}>
                  {reviewResult.isRelevant ? 'Relevant' : 'Not Relevant'}
                </Badge>
              </p>
              <div>
                <strong className="block mb-1 text-sm">AI Feedback:</strong>
                <p className="text-sm">{reviewResult.feedback}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other widgets - Placeholder/Simulated Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Track overall student activity and performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center text-muted-foreground h-32 border border-dashed rounded-md">
              <BarChart2 className="h-8 w-8 mr-2" /> Engagement Chart (Coming Soon)
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common professor tasks (Features coming soon).</CardDescription>
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