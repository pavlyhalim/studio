
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, BookOpen, PlusCircle, Trash2 } from "lucide-react"; // Changed BarChart to BookOpen, added icons
import {
    sampleUsers as initialSampleUsers, // Use initial data only for initialization
    sampleCourses as initialSampleCourses, // Use initial data only for initialization
    sampleEnrollments as initialSampleEnrollments, // Use initial data
    addSampleUser,
    addSampleCourse,
    updateSampleUsers, // Import update function
    updateSampleCourses, // Import update function
    updateSampleEnrollments, // Import update function
    type User,
    type Course,
    type Enrollment
} from "@/lib/sample-data"; // Import sample data and manipulation functions
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export function AdminDashboard() {
  const { toast } = useToast();
  // Use state to manage users and courses for reactivity after adding/deleting
  // Initialize state with the imported sample data
  const [users, setUsers] = useState<User[]>(initialSampleUsers);
  const [courses, setCourses] = useState<Course[]>(initialSampleCourses);
  // Use state for enrollments to track changes when users/courses are deleted
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialSampleEnrollments);


  // State for Add User form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'professor' | 'admin' | ''>('');

  // State for Add Course form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseProfessorId, setNewCourseProfessorId] = useState('');

  // Derive professors from the current users state
  const professors = users.filter(u => u.role === 'professor');
  const totalUsers = users.length;
  const totalCourses = courses.length;


  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast({ title: "Missing Fields", description: "Please fill all user details.", variant: "destructive" });
      return;
    }
    // addSampleUser now MUTATES the global sampleUsers for demo purposes and returns the new user
    const newUser = addSampleUser({ name: newUserName, email: newUserEmail, role: newUserRole });

    // Since addSampleUser mutates the global array, we update the local state
    // by re-reading the potentially modified global array (or just adding the newUser)
    // To ensure reactivity, it's better to update state immutably:
    setUsers(currentUsers => {
        // Check if the user was actually added (might be duplicate)
        const existingUser = currentUsers.find(u => u.id === newUser.id);
        if (!existingUser) {
            toast({ title: "User Added", description: `User ${newUser.name} created successfully.` });
            return [...currentUsers, newUser];
        } else {
             // Already handled by addSampleUser's console warning
            return currentUsers; // No change to state if duplicate
        }
    });


    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('');
  };

    const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDescription || !newCourseProfessorId) {
      toast({ title: "Missing Fields", description: "Please fill all course details.", variant: "destructive" });
      return;
    }
    // addSampleCourse now MUTATES the global sampleCourses for demo purposes and returns the new course
    const newCourse = addSampleCourse({ title: newCourseTitle, description: newCourseDescription, professorId: newCourseProfessorId });

     // Update the component's local state based on the (potentially) mutated global state
     setCourses(currentCourses => {
         const existingCourse = currentCourses.find(c => c.id === newCourse.id);
         if (!existingCourse) {
            toast({ title: "Course Added", description: `Course "${newCourse.title}" created successfully.` });
            return [...currentCourses, newCourse];
         } else {
             // Already handled by addSampleCourse's console warning
            return currentCourses; // No change if duplicate
         }
     });

    // Reset form
    setNewCourseTitle('');
    setNewCourseDescription('');
    setNewCourseProfessorId('');
  };

   // Simulate deleting a user (local state update only)
   const handleDeleteUser = (userId: string) => {
     const userToDelete = users.find(u => u.id === userId);
     if (!userToDelete) return;

     // Prevent deleting the last admin or oneself (in a real app)
     if (userToDelete.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
         toast({ title: "Action Denied", description: "Cannot delete the last administrator.", variant: "destructive"});
         return;
     }
     // TODO: Add check for deleting self

     // Update local users state
     const updatedUsers = users.filter(user => user.id !== userId);
     setUsers(updatedUsers);
     updateSampleUsers(updatedUsers); // Update "global" state for demo consistency

     // Remove enrollments associated with the user (if student)
     if(userToDelete.role === 'student') {
         const updatedEnrollments = enrollments.filter(e => e.studentId !== userId);
         setEnrollments(updatedEnrollments);
         updateSampleEnrollments(updatedEnrollments); // Update "global" state
         console.log(`Simulating removal of enrollments for student ${userId}`);
     }
     // If professor, potentially unassign courses or reassign
     if(userToDelete.role === 'professor') {
         const updatedCourses = courses.map(c => c.professorId === userId ? { ...c, professorId: 'unassigned' } : c); // Example: mark as unassigned
         setCourses(updatedCourses);
         updateSampleCourses(updatedCourses);
          console.log(`Simulating unassignment of courses for professor ${userId}`);
     }

     toast({ title: "User Deleted", description: `User ${userToDelete.name} removed (simulated).` });
   };

   // Simulate deleting a course (local state update only)
    const handleDeleteCourse = (courseId: string) => {
        const courseToDelete = courses.find(c => c.id === courseId);
        if (!courseToDelete) return;

        // Update local courses state
        const updatedCourses = courses.filter(course => course.id !== courseId);
        setCourses(updatedCourses);
        updateSampleCourses(updatedCourses); // Update "global" state

        // Also remove enrollments, assignments, grades etc. associated with the course
         const updatedEnrollments = enrollments.filter(e => e.courseId !== courseId);
         setEnrollments(updatedEnrollments);
         updateSampleEnrollments(updatedEnrollments); // Update "global" state

        // In a real app, would also delete assignments, grades, files etc.
        console.log(`Simulating removal of related data (enrollments) for course ${courseId}`);
        toast({ title: "Course Deleted", description: `Course "${courseToDelete.title}" removed (simulated).` });
    };


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
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            {/* <p className="text-xs text-muted-foreground">+X% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
             <BookOpen className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{totalCourses}</div>
             {/* <p className="text-xs text-muted-foreground">+Y since last week</p> */}
           </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
             <Settings className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-green-600 dark:text-green-400">Operational</div> {/* Explicit green color for status */}
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
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
                 <div>
                    <Label htmlFor="new-user-name">Name</Label>
                    <Input id="new-user-name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" required />
                 </div>
                 <div>
                     <Label htmlFor="new-user-email">Email</Label>
                    <Input id="new-user-email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" required />
                 </div>
                 <div>
                     <Label htmlFor="new-user-role">Role</Label>
                     <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as any)} required>
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

           <h3 className="text-lg font-semibold mb-3">Existing Users</h3>
          <ScrollArea className="h-72 border rounded-md"> {/* Added border */}
            <ul className="divide-y divide-border">
              {users.map(user => (
                <li key={user.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                  <div className="flex items-center gap-3">
                     {/* Optional: Add Avatar */}
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'professor' ? 'secondary' : 'outline'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      {/* Delete User Button with Confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Delete user ${user.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user
                              ({user.name}) and remove their associated data (enrollments, etc.).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
           {/* <Button variant="outline" className="mt-4" disabled>View All Users</Button> */}
        </CardContent>
      </Card>

      {/* Course Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>Create new courses or manage existing ones.</CardDescription>
        </CardHeader>
        <CardContent>
           <h3 className="text-lg font-semibold mb-3">Add New Course</h3>
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-secondary/10">
                 <div>
                    <Label htmlFor="new-course-title">Title</Label>
                    <Input id="new-course-title" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="Course Title" required />
                 </div>
                 <div className="md:col-span-2">
                     <Label htmlFor="new-course-description">Description</Label>
                    <Input id="new-course-description" value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} placeholder="Brief description..." required />
                 </div>
                 <div>
                     <Label htmlFor="new-course-professor">Assign Professor</Label>
                     <Select value={newCourseProfessorId} onValueChange={(value) => setNewCourseProfessorId(value)} required>
                         <SelectTrigger id="new-course-professor">
                            <SelectValue placeholder="Select professor" />
                         </SelectTrigger>
                         <SelectContent>
                             {professors.length > 0 ? professors.map(prof => (
                                <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                             )) : <SelectItem value="" disabled>No professors available</SelectItem>}
                         </SelectContent>
                     </Select>
                 </div>
                 <div className="md:col-start-4 flex items-end">
                    <Button type="submit" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                    </Button>
                 </div>
            </form>

            <h3 className="text-lg font-semibold mb-3">Existing Courses</h3>
             <ScrollArea className="h-72 border rounded-md">
                <ul className="divide-y divide-border">
                 {courses.map(course => {
                    // Find professor from the current *state*, not initialSampleUsers
                    const professor = users.find(u => u.id === course.professorId);
                    // Count students from the current *state* of enrollments
                    const studentCount = enrollments.filter(e => e.courseId === course.id).length;

                    return (
                        <li key={course.id} className="flex justify-between items-center p-3 hover:bg-secondary/10">
                        <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Professor: {professor?.name ?? 'N/A'} | Students: {studentCount}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Delete Course Button */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Delete course ${course.title}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the course
                                      "{course.title}" and all associated data (assignments, grades, enrollments, files).
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete Course
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            {/* <Button variant="outline" size="sm" disabled>Manage</Button> */}
                        </div>
                        </li>
                    );
                    })}
                </ul>
            </ScrollArea>
        </CardContent>
      </Card>


       {/* Platform Settings Section */}
       <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
           <CardDescription>Configure global platform settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI model configuration, feature flags, theme customization, etc.</p>
          {/* TODO: Implement platform settings form */}
           <Button variant="outline" className="mt-4" disabled>Configure Settings</Button>
        </CardContent>
      </Card>

    </div>
  );
}
