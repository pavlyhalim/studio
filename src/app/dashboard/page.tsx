
// TODO: Implement role-based dashboards (Student, Professor, Admin)
// This is a placeholder page.

import { Navbar } from '@/components/landing/navbar'; // Reusing Navbar for now
import { Footer } from '@/components/landing/footer'; // Reusing Footer for now
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chatbot } from '@/components/chatbot/chatbot'; // Import the Chatbot component

export default function DashboardPage() {
    // In a real app, useAuth() would determine the user's role
    // and conditionally render the appropriate dashboard components.
    // const { user, role } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Dashboard</h1>
             {/* Placeholder Content - Replace with role-specific dashboard */}
             <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Welcome!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This is your dashboard. Role-specific content will appear here.</p>
                </CardContent>
             </Card>

            {/* Integrate Chatbot Component */}
            <Chatbot />

        </main>
        <Footer />
    </div>
  );
}
