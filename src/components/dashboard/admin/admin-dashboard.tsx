// src/components/dashboard/admin/admin-dashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, BookOpen, PlusCircle, Trash2, Save, Loader2 } from "lucide-react";
import {
    getUserById,
    getAllActiveCourses,
    createUser,
    createCourse,
    deleteUser,
    archiveCourse,
    updateUserProfile,
} from '@/lib/firebase-services'; 
import { 
    UserRecord,
    CourseRecord,
} from '@/lib/models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/models';

// Define types for settings state
interface PlatformSettings {
    aiModel: string;
    enableStudyPlanner: boolean;
    enableLiveTranscriptions: boolean;
    theme: 'light' | 'dark';
}

// Define SimpleUser type without password hash for client-side state
type SimpleUser = Omit<UserRecord, 'passwordHash'>;

export function AdminDashboard() {
  const { toast } = useToast();

  // General state 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for managing data displayed in the dashboard
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  
  // State for Add User form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
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

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users and courses from Firebase
        const usersQuery = query(collection(db, COLLECTIONS.USERS));
        const coursesQuery = query(collection(db, COLLECTIONS.COURSES), where("status", "==", "active"));

        const [usersSnapshot, coursesSnapshot] = await Promise.all([
          getDocs(usersQuery),
          getDocs(coursesQuery)
        ]);

        // Process users data, removing sensitive information
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data() as UserRecord;
          // Omit passwordHash from the user data
          const { passwordHash, ...userWithoutHash } = data;
          return userWithoutHash as SimpleUser;
        });

        // Process courses data
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseRecord[];

        setUsers(usersData);
        setCourses(coursesData);

      } catch (err) {
        console.error('Error loading admin data:', err);
        setError('Failed to load administrative data. Please try again.');
        toast({
          title: 'Loading Error',
          description: 'There was an error loading the dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [toast]);

  // Derive professors from the current users state
  const professors = users.filter(u => u.role === 'professor');
  const totalUsers = users.length;
  const totalCourses = courses.length;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill name, email, password, and role.", 
        variant: "destructive" 
      });
      return;
    }
    if (newUserPassword.length < 6) {
      toast({ 
        title: "Password Too Short", 
        description: "Password must be at least 6 characters.", 
        variant: "destructive" 
      });
      return;
    }

    const lowerCaseEmail = newUserEmail.toLowerCase();

    try {
      // Create the user in Firebase
      const newUser = await createUser(
        newUserName,
        lowerCaseEmail,
        newUserPassword,
        newUserRole
      );

      // Update local state with the new user (excluding password hash)
      const { passwordHash, ...userWithoutHash } = newUser;
      setUsers(prev => [...prev, userWithoutHash]);

      toast({ 
        title: "User Added", 
        description: `User ${newUser.name} created successfully.` 
      });

      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('');

    } catch (error: any) {
      console.error("Error adding user:", error);
      let errorMessage = "Failed to create user.";
      
      // Parse Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "A user with this email already exists.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. It should be at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Creation Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDescription || !newCourseProfessorId) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill all course details.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      // Create the course in Firebase
      const newCourse = await createCourse({
        title: newCourseTitle,
        description: newCourseDescription,
        professorId: newCourseProfessorId
      });

      // Update local state with the new course
      setCourses(prev => [...prev, newCourse]);

      toast({ 
        title: "Course Added", 
        description: `Course "${newCourse.title}" created successfully.` 
      });

      // Reset form
      setNewCourseTitle('');
      setNewCourseDescription('');
      setNewCourseProfessorId('');
    } catch (error: any) {
      console.error("Error adding course:", error);
      
      toast({ 
        title: "Creation Error", 
        description: error.message || "Failed to create course.", 
        variant: "destructive" 
      });
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // Basic safety check
    if (userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      toast({ 
        title: "Action Denied", 
        description: "Cannot delete the last administrator.", 
        variant: "destructive"
      });
      return;
    }

    try {
      // Delete the user from Firebase
      await deleteUser(userId);

      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      toast({ 
        title: "User Deleted", 
        description: `User ${userToDelete.name} removed.` 
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      
      toast({ 
        title: "Deletion Failed", 
        description: error.message || `Could not delete user ${userToDelete.name}.`, 
        variant: "destructive"
      });
    }
  };

  // Delete (archive) a course
  const handleDeleteCourse = async (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    if (!courseToDelete) return;

    try {
      // Archive the course in Firebase (soft delete)
      await archiveCourse(courseId);

      // Update local state
      setCourses(prev => prev.filter(c => c.id !== courseId));
      
      toast({ 
        title: "Course Deleted", 
        description: `Course "${courseToDelete.title}" removed.` 
      });
    } catch (error: any) {
      console.error("Error deleting course:", error);
      
      toast({ 
        title: "Deletion Failed", 
        description: error.message || `Could not delete course "${courseToDelete.title}".`, 
        variant: "destructive"
      });
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
    toast({ title: "Settings Saved", description: "Platform settings have been updated." });

    // Apply theme change
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', platformSettings.theme === 'dark');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Loading administrative data...</p>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalCourses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Operational</div>
            <p className="text-xs text-muted-foreground">All systems normal</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, add, or remove users from the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Add New User</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
            <div>
              <Label htmlFor="new-user-name">Name</Label>
              <Input 
                id="new-user-name" 
                value={newUserName} 
                onChange={(e) => setNewUserName(e.target.value)} 
                placeholder="Full Name" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-user-email">Email</Label>
              <Input 
                id="new-user-email" 
                type="email" 
                value={newUserEmail} 
                onChange={(e) => setNewUserEmail(e.target.value)} 
                placeholder="email@example.com" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-user-password">Password</Label>
              <Input 
                id="new-user-password" 
                type="password" 
                value={newUserPassword} 
                onChange={(e) => setNewUserPassword(e.target.value)} 
                placeholder="Min. 6 characters" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-user-role">Role</Label>
              <Select 
                value={newUserRole} 
                onValueChange={(value) => setNewUserRole(value as any)} 
                required
              >
                <SelectTrigger id="new-user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </form>

          <h3 className="text-lg font-semibold mb-3">Existing Users ({users.length})</h3>
          <ScrollArea className="h-72 border rounded-md">
            {users.length > 0 ? (
              <ul className="divide-y divide-border">
                {users.map(user => (
                  <li key={user.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          user.role === 'admin' ? 'destructive' : 
                          user.role === 'professor' ? 'secondary' : 'outline'
                        }
                      >
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/80 h-8 w-8" 
                            aria-label={`Delete user ${user.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user ({user.name}) and remove their associated data (enrollments, grades, etc.).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-muted-foreground">No users found.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Course Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>View, add, or archive courses on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Add New Course</h3>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
            <div className="md:col-span-2">
              <Label htmlFor="new-course-title">Course Title</Label>
              <Input 
                id="new-course-title" 
                value={newCourseTitle} 
                onChange={(e) => setNewCourseTitle(e.target.value)} 
                placeholder="e.g., Introduction to Biology" 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-course-description">Description</Label>
              <Input 
                id="new-course-description" 
                value={newCourseDescription} 
                onChange={(e) => setNewCourseDescription(e.target.value)} 
                placeholder="Brief description" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-course-professor">Professor</Label>
              <Select 
                value={newCourseProfessorId} 
                onValueChange={setNewCourseProfessorId} 
                required
              >
                <SelectTrigger id="new-course-professor">
                  <SelectValue placeholder="Select professor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </div>
          </form>

          <h3 className="text-lg font-semibold mb-3">Active Courses ({courses.length})</h3>
           <ScrollArea className="h-72 border rounded-md">
            {courses.length > 0 ? (
              <ul className="divide-y divide-border">
                {courses.map(course => (
                  <li key={course.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2">
                       {/* Display professor name if available */}
                       {professors.find(p => p.id === course.professorId) && (
                         <Badge variant="secondary">
                           {professors.find(p => p.id === course.professorId)?.name}
                         </Badge>
                       )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive/80 h-8 w-8" 
                              aria-label={`Delete course ${course.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will archive the course "{course.title}". It will no longer be accessible to students, but data will be retained for administrative purposes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Archive Course
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-muted-foreground">No active courses found.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

       {/* Platform Settings Section */}
       <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure global settings for the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select 
              value={platformSettings.aiModel} 
              onValueChange={(value) => handleSettingChange('aiModel', value)}
            >
              <SelectTrigger id="ai-model" className="w-[200px]">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="googleai/gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="googleai/gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                {/* Add other models as needed */}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enable-study-planner">Enable Study Planner</Label>
            <Switch
              id="enable-study-planner"
              checked={platformSettings.enableStudyPlanner}
              onCheckedChange={(checked) => handleSettingChange('enableStudyPlanner', checked)}
            />
          </div>

           <div className="flex items-center justify-between">
            <Label htmlFor="enable-live-transcriptions">Enable Live Transcriptions</Label>
            <Switch
              id="enable-live-transcriptions"
              checked={platformSettings.enableLiveTranscriptions}
              onCheckedChange={(checked) => handleSettingChange('enableLiveTranscriptions', checked)}
            />
          </div>

           <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
             <Select 
              value={platformSettings.theme} 
              onValueChange={(value) => handleSettingChange('theme', value as 'light' | 'dark')}
            >
              <SelectTrigger id="theme-select" className="w-[150px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
             <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

// Helper function to get user by ID (if needed elsewhere, otherwise remove)
// async function getUserById(userId: string): Promise<UserRecord | null> {
//   try {
//     const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
//     if (userDoc.exists()) {
//       return userDoc.data() as UserRecord;
//     } else {
//       console.warn(`User with ID ${userId} not found.`);
//       return null;
//     }
//   } catch (error) {
//     console.error(`Error fetching user ${userId}:`, error);
//     throw error;
//   }
// }