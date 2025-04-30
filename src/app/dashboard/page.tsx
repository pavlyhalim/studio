"use client"; // Required for useState, useEffect, and interactive components

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { StudentDashboard } from '@/components/dashboard/student/student-dashboard';
import { ProfessorDashboard } from '@/components/dashboard/professor/professor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
    const { user, loading, role, setRole } = useAuth();
    // const router = useRouter(); // Keep commented out as login is bypassed

    // Local state to manage role selection in demo mode
    // Initialize with the role from AuthContext
    const [selectedRole, setSelectedRole] = useState<UserRole>(role);

    // Update local state if role from context changes (e.g., on login/logout)
    useEffect(() => {
        setSelectedRole(role);
    }, [role]);


    // Handle role change from the dropdown selector
    const handleRoleChange = (newRole: string) => {
        const validRole = newRole as UserRole;
        if (validRole && ['student', 'professor', 'admin'].includes(validRole)) {
             console.log("Role selected in dropdown:", validRole);
            setRole(validRole); // Update role in AuthContext
            setSelectedRole(validRole); // Update local state
        } else {
            console.warn("Invalid role selected:", newRole);
            // Optionally reset to a default or handle error
            setRole(null);
            setSelectedRole(null);
        }
    };


    // Show loading state
    if (loading) {
        return (
             <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                    <Card className="w-full max-w-md text-center">
                         <CardHeader>
                            <CardTitle>Loading Dashboard...</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                         </CardContent>
                    </Card>
                </main>
                <Footer />
             </div>
        );
    }

    // Login bypass: We check the role directly instead of redirecting
    // if (!loading && !user) {
    //     // Redirect logic is bypassed
    //     // router.push('/login');
    //     // return null; // Or a message indicating login is required in a real scenario
    // }


  const renderDashboardContent = () => {
    console.log("Rendering dashboard for role:", selectedRole);
    switch (selectedRole) {
      case 'student':
        return <StudentDashboard />;
      case 'professor':
        return <ProfessorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please select a role using the dropdown above to view the corresponding dashboard.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
             {/* Temporary Role Selector for Demo */}
             <Card className="bg-secondary/30 border-secondary">
                <CardHeader>
                    <CardTitle>Demo Role Selector</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-4">
                     <Label htmlFor="role-select" className="text-lg font-medium text-primary">Select Role:</Label>
                     <Select
                        value={selectedRole ?? ''}
                        onValueChange={handleRoleChange}
                        // disabled={!!user} // Disable if user is logged in, as role should come from backend
                     >
                        <SelectTrigger id="role-select" className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className="text-sm text-muted-foreground">(This selector is for demo purposes as login is currently bypassed. In a real app, roles are assigned upon login.)</p>
                </CardContent>
             </Card>

            {/* Render the appropriate dashboard based on the selected role */}
            {renderDashboardContent()}

        </main>
        <Footer />
    </div>
  );
}