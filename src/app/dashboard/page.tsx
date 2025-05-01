"use client"; // Required for useState, useEffect, and interactive components

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { StudentDashboard } from '@/components/dashboard/student/student-dashboard';
import { ProfessorDashboard } from '@/components/dashboard/professor/professor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
    // Use updated hook: `user` is now SimpleUser | null
    const { user, loading, role, setRole } = useAuth();
    const { toast } = useToast();
    // Local state manages the dropdown selection visually
    const [selectedRole, setSelectedRole] = useState<UserRole>(role);

    // Update local dropdown state if the effective role from context changes
    useEffect(() => {
        console.log("DashboardPage: Effective role from context changed to:", role);
        setSelectedRole(role);
    }, [role]);


    // Handle role change from the dropdown selector (FOR DEMO PURPOSES WHEN LOGGED OUT)
    const handleRoleChange = (newRole: string) => {
        const validRole = newRole as UserRole;
        // Only allow setting the role via dropdown if the user is NOT logged in
        if (!user) {
            if (validRole && ['student', 'professor', 'admin'].includes(validRole)) {
                 console.log("Role selected in dropdown (demo mode):", validRole);
                 if (typeof setRole === 'function') {
                    // setRole now only updates the demo state if logged out
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
                setSelectedRole(validRole);
            } else {
                console.warn("Invalid role selected:", newRole);
                 if (typeof setRole === 'function') {
                    setRole(null); // Reset context demo role if invalid selection
                 }
                setSelectedRole(null); // Reset local state
            }
        } else {
            console.log("Dropdown change ignored: User is logged in. Role is determined by user data.");
            toast({
                title: "Role Locked",
                description: "Cannot change role via dropdown while logged in.",
            });
            // Ensure dropdown visually reverts to the actual role if user tries to change it
            setSelectedRole(role);
        }
    };


    // Show loading state while checking auth status or fetching user data
    if (loading) {
        return (
             <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                         <CardHeader>
                            <CardTitle className="text-2xl">Loading Dashboard...</CardTitle>
                         </CardHeader>
                         <CardContent className="py-10">
                             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                         </CardContent>
                    </Card>
                </main>
                <Footer />
             </div>
        );
    }


  const renderDashboardContent = () => {
    console.log("Rendering dashboard for effective role:", role); // Render based on effective role from context
    switch (role) { // Use role from useAuth
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
                 {/* Updated message for when user exists but role is unknown */}
                 {user ? "Your role could not be determined." : "Please choose a demo role from the dropdown above to view the corresponding dashboard."}
               </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {/* Updated message for when user exists but role is unknown */}
                {user ? "Your account role might be missing or invalid." : "Use the role selector above to explore different dashboard views in this demo application."}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/5">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
             {/* Role Selector */}
             <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-border shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">
                      {user ? "Your Role" : "Demo Role Selector"}
                    </CardTitle>
                    <CardDescription>
                       {/* Use the role determined by context */}
                       {user ? `You are logged in as a ${role || 'user with undetermined role'}.` : "Switch between dashboard views for demonstration purposes."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                     <div className="flex items-center space-x-2 flex-shrink-0">
                        <Label htmlFor="role-select" className="text-base font-medium text-foreground">Select Role:</Label>
                        <Select
                            value={selectedRole ?? ''} // Ensure dropdown reflects local state
                            onValueChange={handleRoleChange}
                            disabled={!!user} // Disable dropdown if user is logged in
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

        </main>
        <Footer />
    </div>
  );
}
