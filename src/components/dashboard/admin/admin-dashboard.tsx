
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, BookOpen, PlusCircle, Trash2, Save, Loader2 } from "lucide-react";
import {
    getInitialSampleUsersForClient, // Use function to get client-safe user list
    initialSampleCourses,
    initialSampleEnrollments,
    initialSampleAssignments,
    initialSampleGrades,
    initialSampleAnnouncements, // Added import
    initialSampleUploadedFiles, // Added import
    createSampleUser, // Use simulation function
    createSampleCourse, // Use simulation function
    deleteSampleUser, // Use simulation function
    deleteSampleCourse, // Use simulation function
    mockUsersDb, // Import the mock DB for user lookups
    type User, // Full User type (needed for lookups)
    type Course,
    type Enrollment,
    type Assignment,
    type Grade,
    type Announcement, // Added import
    type UploadedFile // Added import
} from "@/lib/sample-data"; // Import initial data and simulation functions
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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

// Define types for settings state
interface PlatformSettings {
    aiModel: string;
    enableStudyPlanner: boolean;
    enableLiveTranscriptions: boolean;
    theme: 'light' | 'dark';
}

// Define SimpleUser type without password hash for client-side state
type SimpleUser = Omit<User, 'passwordHash'>;

export function AdminDashboard() {
  const { toast } = useToast();

  // State for managing data displayed in the dashboard
  // Initialize with client-safe data or mutable arrays for simulation
  const [users, setUsers] = useState<SimpleUser[]>(getInitialSampleUsersForClient());
  const [courses, setCourses] = useState<Course[]>(initialSampleCourses);
  // Use enrollments state to track dynamic changes
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialSampleEnrollments);

  // State for Add User form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(''); // Add password field
  const [newUserRole, setNewUserRole] = useState<'student' | 'professor' | 'admin' | ''>('');

  // State for Add Course form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseProfessorId, setNewCourseProfessorId] = useState('');

   // State for Platform Settings
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
        aiModel: 'googleai/gemini-2.0-flash', // Default value matching ai-instance
        enableStudyPlanner: true,
        enableLiveTranscriptions: false,
        theme: 'light', // Default theme
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Derive professors from the current users state
  const professors = users.filter(u => u.role === 'professor');
  const totalUsers = users.length;
  const totalCourses = courses.length;


  // Re-sync local state if the underlying sample data arrays might change externally
  // This is a simple way to reflect changes made by the simulation functions
  useEffect(() => {
    setUsers(getInitialSampleUsersForClient());
    setCourses([...initialSampleCourses]); // Use spread to create new array reference
    setEnrollments([...initialSampleEnrollments]);
    // Note: Assignments, Grades etc. are not directly managed here, but deleted via cascade
  }, []); // Run once on mount, or add dependencies if external changes need tracking

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      toast({ title: "Missing Fields", description: "Please fill name, email, password, and role.", variant: "destructive" });
      return;
    }
     if (newUserPassword.length < 6) {
        toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
        return;
     }

    const lowerCaseEmail = newUserEmail.toLowerCase();

    // Check if user already exists in the MOCK DB (simulating backend check)
    if (mockUsersDb.has(lowerCaseEmail)) {
      toast({ title: "User Exists", description: `User with email ${newUserEmail} already exists.`, variant: "destructive" });
      return;
    }

    // Simulate API call: Use createSampleUser which adds to mock DB and MUTATES sample data
    try {
        // The createSampleUser function now handles hashing and adding to mockUsersDb
        const newUserObject = createSampleUser({
            name: newUserName,
            email: lowerCaseEmail,
            role: newUserRole,
            passwordPlain: newUserPassword, // Pass plain password for hashing simulation
        });

        // Update local state IMMUTABLY by re-fetching the client-safe list
        setUsers(getInitialSampleUsersForClient());

        toast({ title: "User Added", description: `User ${newUserObject.name} created successfully (simulated).` });

        // Reset form
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('');

    } catch (error) {
         console.error("Error adding user:", error);
         toast({ title: "Creation Error", description: "Failed to simulate user creation.", variant: "destructive" });
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDescription || !newCourseProfessorId) {
      toast({ title: "Missing Fields", description: "Please fill all course details.", variant: "destructive" });
      return;
    }

    // Use simulation function which checks for existing title and MUTATES sample data
     const simulationResult = createSampleCourse({ title: newCourseTitle, description: newCourseDescription, professorId: newCourseProfessorId });

     if ('error' in simulationResult) {
         toast({ title: "Creation Error", description: simulationResult.error, variant: "destructive" });
         return;
     }

     // Update the component's local state by re-reading the mutated array
     setCourses([...initialSampleCourses]);

     toast({ title: "Course Added", description: `Course "${simulationResult.title}" created successfully (simulated).` });

    // Reset form
    setNewCourseTitle('');
    setNewCourseDescription('');
    setNewCourseProfessorId('');
  };

   // Simulate deleting a user
   const handleDeleteUser = (userId: string) => {
     const userToDelete = users.find(u => u.id === userId); // Find from local state
     if (!userToDelete) return;

     // Basic safety check
     if (userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
         toast({ title: "Action Denied", description: "Cannot delete the last administrator.", variant: "destructive"});
         return;
     }

      // Use simulation function which removes from mock DB and MUTATES sample data arrays
     const success = deleteSampleUser(userId);

     if (success) {
         // Update local state by re-fetching client-safe list
         setUsers(getInitialSampleUsersForClient());
         // Update enrollments state as well, as they might have been cascaded
         setEnrollments([...initialSampleEnrollments]);
         toast({ title: "User Deleted", description: `User ${userToDelete.name} removed (simulated).` });
     } else {
          toast({ title: "Deletion Failed", description: `Could not delete user ${userToDelete.name}.`, variant: "destructive"});
     }
   };

   // Simulate deleting a course
    const handleDeleteCourse = (courseId: string) => {
        const courseToDelete = courses.find(c => c.id === courseId); // Find from local state
        if (!courseToDelete) return;

        // Use simulation function which removes course and MUTATES related data arrays
        const success = deleteSampleCourse(courseId);

        if (success) {
            // Update local state by re-reading mutated arrays
            setCourses([...initialSampleCourses]);
            setEnrollments([...initialSampleEnrollments]);
            // Note: Assignments, grades etc. related to this course are also removed
            // from the sample data arrays by deleteSampleCourse
            toast({ title: "Course Deleted", description: `Course "${courseToDelete.title}" removed (simulated).` });
        } else {
             toast({ title: "Deletion Failed", description: `Could not delete course "${courseToDelete.title}".`, variant: "destructive"});
        }
    };

    // Handle Platform Settings Change
    const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
        setPlatformSettings(prev => ({ ...prev, [key]: value }));
    };

    // Simulate saving settings
    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        console.log("Simulating saving platform settings:", platformSettings);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setIsSavingSettings(false);
        toast({ title: "Settings Saved", description: "Platform settings have been updated (simulated)." });

        // Apply theme change (basic example)
        if (typeof window !== 'undefined') {
             document.documentElement.classList.toggle('dark', platformSettings.theme === 'dark');
        }
    };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Courses</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalCourses}</div></CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Platform Status</CardTitle><Settings className="h-4 w-4 text-muted-foreground" /></CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600 dark:text-green-400">Operational</div><p className="text-xs text-muted-foreground">All systems normal</p></CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card>
        <CardHeader><CardTitle>User Management</CardTitle><CardDescription>View, add, or remove users from the platform.</CardDescription></CardHeader>
        <CardContent>
           <h3 className="text-lg font-semibold mb-3">Add New User</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
                 <div><Label htmlFor="new-user-name">Name</Label><Input id="new-user-name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" required /></div>
                 <div><Label htmlFor="new-user-email">Email</Label><Input id="new-user-email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" required /></div>
                 <div><Label htmlFor="new-user-password">Password</Label><Input id="new-user-password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Min. 6 characters" required /></div>
                 <div>
                     <Label htmlFor="new-user-role">Role</Label>
                     <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as any)} required>
                         <SelectTrigger id="new-user-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                         <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="professor">Professor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                     </Select>
                 </div>
                 <div className="flex items-end">
                    <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
                 </div>
            </form>

           <h3 className="text-lg font-semibold mb-3">Existing Users ({users.length})</h3>
          <ScrollArea className="h-72 border rounded-md">
            {users.length > 0 ? (
                <ul className="divide-y divide-border">
                {users.map(user => (
                    <li key={user.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                        <div className="flex items-center gap-3"><div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></div>
                        <div className="flex items-center gap-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'professor' ? 'secondary' : 'outline'}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</Badge>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Delete user ${user.name}`}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the user ({user.name}) and remove their associated data (enrollments, grades, etc.).</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete User</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </li>
                ))}
                </ul>
            ) : ( <p className="text-center text-muted-foreground p-4">No users found.</p> )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Course Management Section */}
      <Card>
        <CardHeader><CardTitle>Course Management</CardTitle><CardDescription>Create new courses or manage existing ones.</CardDescription></CardHeader>
        <CardContent>
           <h3 className="text-lg font-semibold mb-3">Add New Course</h3>
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
                 <div><Label htmlFor="new-course-title">Title</Label><Input id="new-course-title" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="Course Title" required /></div>
                 <div className="md:col-span-2"><Label htmlFor="new-course-description">Description</Label><Input id="new-course-description" value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} placeholder="Brief description..." required /></div>
                 <div>
                     <Label htmlFor="new-course-professor">Assign Professor</Label>
                     <Select value={newCourseProfessorId} onValueChange={(value) => setNewCourseProfessorId(value)} required>
                         <SelectTrigger id="new-course-professor"><SelectValue placeholder="Select professor" /></SelectTrigger>
                         <SelectContent>
                             {professors.length > 0 ? professors.map(prof => (<SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>)) : <SelectItem value="" disabled>No professors available</SelectItem>}
                         </SelectContent>
                     </Select>
                 </div>
                 <div className="md:col-start-4 flex items-end"><Button type="submit" className="w-full" disabled={professors.length === 0}><PlusCircle className="mr-2 h-4 w-4" /> Add Course</Button></div>
            </form>

            <h3 className="text-lg font-semibold mb-3">Existing Courses ({courses.length})</h3>
             <ScrollArea className="h-72 border rounded-md">
                {courses.length > 0 ? (
                    <ul className="divide-y divide-border">
                    {courses.map(course => {
                        // Find professor from the current local state
                        const professor = users.find(u => u.id === course.professorId);
                        // Count students from the current local state of enrollments
                        const studentCount = enrollments.filter(e => e.courseId === course.id).length;

                        return (
                            <li key={course.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                            <div><p className="font-medium">{course.title}</p><p className="text-sm text-muted-foreground">Professor: {professor?.name ?? <span className="text-destructive">Unassigned</span>} | Students: {studentCount}</p></div>
                            <div className="flex items-center gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Delete course ${course.title}`}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the course "{course.title}" and all associated data (assignments, grades, enrollments, files).</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Course</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            </li>
                        );
                        })}
                    </ul>
                ) : ( <p className="text-center text-muted-foreground p-4">No courses found.</p> )}
            </ScrollArea>
        </CardContent>
      </Card>


       {/* Platform Settings Section */}
       <Card>
        <CardHeader><CardTitle>Platform Settings</CardTitle><CardDescription>Configure global platform settings.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* AI Model Configuration */}
                 <div className="space-y-2">
                    <Label htmlFor="ai-model-select">AI Model</Label>
                    <Select value={platformSettings.aiModel} onValueChange={(value) => handleSettingChange('aiModel', value)}>
                        <SelectTrigger id="ai-model-select"><SelectValue placeholder="Select AI model" /></SelectTrigger>
                        <SelectContent><SelectItem value="googleai/gemini-2.0-flash">Gemini 2.0 Flash</SelectItem><SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem><SelectItem value="googleai/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem></SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select the primary AI model for chatbot and features.</p>
                 </div>

                 {/* Theme Selection */}
                 <div className="space-y-2">
                    <Label htmlFor="theme-select">Platform Theme</Label>
                    <Select value={platformSettings.theme} onValueChange={(value) => handleSettingChange('theme', value as 'light' | 'dark')}>
                        <SelectTrigger id="theme-select"><SelectValue placeholder="Select theme" /></SelectTrigger>
                        <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose the default appearance for the platform.</p>
                 </div>
            </div>

             {/* Feature Flags */}
            <div className="space-y-4">
                 <h4 className="font-medium">Feature Flags</h4>
                 <div className="flex items-center justify-between p-3 border rounded-md">
                    <div><Label htmlFor="enable-study-planner" className="font-normal">Enable AI Study Planner</Label><p className="text-xs text-muted-foreground">Activates the AI-powered study planning feature for students.</p></div>
                    <Switch id="enable-study-planner" checked={platformSettings.enableStudyPlanner} onCheckedChange={(checked) => handleSettingChange('enableStudyPlanner', checked)}/>
                 </div>
                 <div className="flex items-center justify-between p-3 border rounded-md">
                    <div><Label htmlFor="enable-live-transcriptions" className="font-normal">Enable Live Lecture Transcriptions</Label><p className="text-xs text-muted-foreground">Provides real-time transcriptions during live video sessions (feature not implemented).</p></div>
                    <Switch id="enable-live-transcriptions" checked={platformSettings.enableLiveTranscriptions} onCheckedChange={(checked) => handleSettingChange('enableLiveTranscriptions', checked)} disabled />
                 </div>
            </div>

             <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full md:w-auto">
                 {isSavingSettings ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4"/> Save Settings</>}
             </Button>
        </CardContent>
      </Card>

    </div>
  );
}
