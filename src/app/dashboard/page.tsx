
"use client"; // Required for useState, useEffect, and interactive components

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { useAuth, type UserRole } from '@/hooks/use-auth';
import { StudentDashboard } from '@/components/dashboard/student/student-dashboard';
import { ProfessorDashboard } from '@/components/dashboard/professor/professor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function DashboardPage() {
    const { user, loading, role, setRole } = useAuth();
    const { toast } = useToast(); // Get toast function
    // Local state to manage role selection in demo mode, initialized with role from AuthContext
    const [selectedRole, setSelectedRole] = useState<UserRole>(role);

    // Update local state if role from context changes (e.g., on login/logout or initial load)
    useEffect(() => {
        setSelectedRole(role);
    }, [role]);


    // Handle role change from the dropdown selector
    const handleRoleChange = (newRole: string) => {
        const validRole = newRole as UserRole;
        if (validRole && ['student', 'professor', 'admin'].includes(validRole)) {
             console.log("Role selected in dropdown:", validRole);
             // Add check to ensure setRole is a function before calling
             if (typeof setRole === 'function') {
                setRole(validRole); // Update role in AuthContext (and consequently the derived userId)
             } else {
                 console.error("setRole is not available or not a function in AuthContext.");
                 toast({
                    title: "Error",
                    description: "Could not change role.",
                    variant: "destructive",
                 });
             }
            setSelectedRole(validRole); // Update local state to immediately reflect change
        } else {
            console.warn("Invalid role selected:", newRole);
             if (typeof setRole === 'function') {
                setRole(null); // Reset context role if invalid selection
             }
            setSelectedRole(null); // Reset local state
        }
    };


    // Show loading state while checking auth status
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
    console.log("Rendering dashboard for role:", selectedRole); // Use selectedRole for rendering
    switch (selectedRole) {
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
               <CardDescription>Please choose a role from the dropdown above to view the corresponding dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use the role selector above to explore different dashboard views in this demo application.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/5"> {/* Subtle background */}
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 space-y-8"> {/* Increased spacing */}
             {/* Temporary Role Selector for Demo */}
             <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-border shadow-sm overflow-hidden"> {/* Subtle gradient and styling */}
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Demo Role Selector</CardTitle>
                    <CardDescription>Switch between dashboard views for demonstration purposes.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                     <div className="flex items-center space-x-2 flex-shrink-0">
                        <Label htmlFor="role-select" className="text-base font-medium text-foreground">Select Role:</Label>
                        <Select
                            value={selectedRole ?? ''} // Ensure value matches the state
                            onValueChange={handleRoleChange}
                            // disabled={!!user} // Keep enabled for demo purposes
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
                     <p className="text-sm text-muted-foreground italic">(This selector allows viewing different dashboards in this demo.)</p>
                </CardContent>
             </Card>

            {/* Render the appropriate dashboard based on the selected role with transition */}
            <div className="transition-opacity duration-300 ease-in-out">
                {renderDashboardContent()}
            </div>

        </main>
        <Footer />
    </div>
  );
}
