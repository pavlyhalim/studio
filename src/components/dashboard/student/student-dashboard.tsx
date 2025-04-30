"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chatbot } from "@/components/chatbot/chatbot"; // Assuming chatbot is reusable

export function StudentDashboard() {
  // Placeholder data or fetch calls specific to students can go here

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>

      {/* Example Student-Specific Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Course list placeholder...</p>
            {/* TODO: List courses the student is enrolled in */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Assignment/Quiz deadlines...</p>
            {/* TODO: Display upcoming deadlines */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent grades placeholder...</p>
            {/* TODO: Show recent grades */}
          </CardContent>
        </Card>
      </div>

       {/* Include Chatbot */}
      <Chatbot />

      {/* Other student-specific sections */}
       <Card>
        <CardHeader>
          <CardTitle>Study Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI Study planner feature placeholder...</p>
          {/* TODO: Implement Study Planner */}
        </CardContent>
      </Card>
    </div>
  );
}