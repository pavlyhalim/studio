
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, BookOpen } from "lucide-react"; // Changed BarChart to BookOpen
import { sampleUsers, sampleCourses } from "@/lib/sample-data"; // Import sample data
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge

export function AdminDashboard() {
  // Use sample data directly
  const totalUsers = sampleUsers.length;
  const totalCourses = sampleCourses.length;
  const users = sampleUsers; // Use all sample users for the list

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
            {/* Optional: Add comparison logic if needed */}
            {/* <p className="text-xs text-muted-foreground">+10% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
             <BookOpen className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{totalCourses}</div>
             {/* Optional: Add comparison logic if needed */}
             {/* <p className="text-xs text-muted-foreground">+2 since last week</p> */}
           </CardContent>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72"> {/* Added ScrollArea */}
            <ul className="space-y-3">
              {users.map(user => (
                <li key={user.id} className="flex justify-between items-center p-3 border rounded-md bg-secondary/20 shadow-sm">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'professor' ? 'secondary' : 'outline'}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {/* TODO: Add buttons for Edit/Delete user actions */}
                   {/* <Button variant="ghost" size="sm" disabled>Edit</Button> */}
                </li>
              ))}
            </ul>
          </ScrollArea>
           <Button variant="outline" className="mt-4" disabled>View All Users</Button> {/* Placeholder */}
        </CardContent>
      </Card>

      {/* Course Management Section (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">Course creation, assignment, etc. placeholder...</p>
           {/* TODO: Implement course management table and actions */}
           <Button variant="outline" className="mt-4" disabled>Manage Courses</Button> {/* Placeholder */}
        </CardContent>
      </Card>


       {/* Platform Settings Section */}
       <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI model configuration, feature flags, etc. placeholder...</p>
          {/* TODO: Implement platform settings form */}
           <Button variant="outline" className="mt-4" disabled>Configure Settings</Button> {/* Placeholder */}
        </CardContent>
      </Card>

    </div>
  );
}
