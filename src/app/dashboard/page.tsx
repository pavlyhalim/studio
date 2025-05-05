
"use client"; // Required for useState, useEffect, and interactive components

import { useState, useEffect } from 'react';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { StudentDashboard } from '@/components/dashboard/student/student-dashboard';
import { ProfessorDashboard } from '@/components/dashboard/professor/professor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

export default function DashboardHomePage() { // Renamed component
    // Use updated hook: `user` is now SimpleUser | null
    // role is the effective role (user's or demo)
    // setRole now sets the demoRole if logged out
    const { user, loading, role, setRole } = useAuth();
    const { toast } = useToast();
    // Local state manages the dropdown selection visually
    const [selectedRole, setSelectedRole] = useState<UserRole>(role);

    // Update local dropdown state if the effective role from context changes
    useEffect(() => {
        console.log("DashboardHomePage: Effective role from context changed to:", role);
        setSelectedRole(role);
    }, [role]);


    // Handle role change from the dropdown selector
    const handleRoleChange = (newRole: string) => {
        const validRole = newRole as UserRole;
        // Allow setting the role via dropdown, context handles whether it's demo or ignored
        if (validRole && ['student', 'professor', 'admin'].includes(validRole)) {
             console.log("Role selected in dropdown:", validRole);
             if (typeof setRole === 'function') {
                // setRole now handles logic: sets demoRole if logged out, otherwise does nothing/logs warning
                setRole(validRole);
             } else {
                 console.error("setRole is not available or not a function in AuthContext.");
                 toast({
                    title: "Error",
                    description: "Could not change demo role.",
                    variant: "destructive",
                 });
             }
            // Update local state immediately to reflect change in dropdown
            // (Context useEffect will sync it back if the change wasn't allowed)
            setSelectedRole(validRole);
        } else {
            console.warn("Invalid role selected:", newRole);
             if (typeof setRole === 'function') {
                setRole(null); // Reset context demo role if invalid selection
             }
            setSelectedRole(null); // Reset local state
        }

        // Provide feedback if user tries to change role while logged in (context handles this internally, but UI feedback is good)
        if (user) {
            toast({
                title: "Role Locked",
                description: "Cannot change role via dropdown while logged in. Log out to switch demo roles.",
            });
            // Visually revert the dropdown if the user is logged in
             setSelectedRole(user.role ?? null);
        }
    };


    // Show loading state while checking auth status or fetching user data
    if (loading) {
        return (
             // Centered loading spinner within the main content area
             <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
                 <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
             </div>
        );
    }


  const renderDashboardContent = () => {
    console.log("Rendering dashboard for effective role:", role); // Render based on effective role from context
    switch (role) { // Use role from useAuth (which is user.role or demoRole)
      case 'student':
        return <StudentDashboard />;
      case 'professor':
        return <ProfessorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <Card className="shadow-lg border-dashed border-primary/30">
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
               <CardDescription>
                 Please choose a demo role from the dropdown above to view the corresponding dashboard.
               </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Use the role selector above to explore different dashboard views in this demo application.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    // Removed outer layout divs (Navbar, Footer), handled by dashboard/layout.tsx
    <div className="space-y-8"> {/* Main content container */}
         {/* Role Selector */}
         <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-border shadow-sm overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xl text-primary">
                  {user ? "Your Role" : "Demo Role Selector"}
                </CardTitle>
                <CardDescription>
                   {/* Use the effective role from context */}
                   {user
                    ? `You are logged in as a ${user.role || 'user with undetermined role'}. Log out to switch demo roles.`
                    : `Currently viewing the ${role || 'default'} dashboard. Switch roles below.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                 <div className="flex items-center space-x-2 flex-shrink-0">
                    <Label htmlFor="role-select" className="text-base font-medium text-foreground">Select Role:</Label>
                    <Select
                        value={selectedRole ?? ''} // Ensure dropdown reflects local state (synced from context's effective role)
                        onValueChange={handleRoleChange}
                        disabled={!!user} // Disable dropdown only if user is logged in
                    >
                        <SelectTrigger id="role-select" className="w-[180px] bg-background shadow-inner">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <p className="text-sm text-muted-foreground italic">
                     {user ? "(Role is determined by your account.)" : "(Select a role to view the demo dashboard.)"}
                 </p>
            </CardContent>
         </Card>

        {/* Render the appropriate dashboard based on the effective role */}
        <div className="transition-opacity duration-300 ease-in-out">
            {renderDashboardContent()}
        </div>

    </div>
  );
}
