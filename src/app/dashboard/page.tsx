
// TODO: Implement role-based dashboards (Student, Professor, Admin) - Currently bypassed for demo
// This is a placeholder page.

import { Navbar } from '@/components/landing/navbar'; // Reusing Navbar for now
import { Footer } from '@/components/landing/footer'; // Reusing Footer for now
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Chatbot } from '@/components/chatbot/chatbot'; // Import the Chatbot component
// import { useAuth } from '@/hooks/use-auth'; // Temporarily commented out
// import { useRouter } from 'next/navigation'; // Temporarily commented out
// import { useEffect } from 'react'; // Temporarily commented out

export default function DashboardPage() {
    // const { user, loading } = useAuth(); // Temporarily commented out
    // const router = useRouter(); // Temporarily commented out

    // useEffect(() => {
    //     // Redirect to login if not authenticated and not loading
    //     if (!loading && !user) {
    //         router.push('/login');
    //     }
    // }, [user, loading, router]); // Temporarily commented out redirect

    // if (loading || !user) {
    //     // Show a loading state or null while checking auth or redirecting
    //     // Or you could show a skeleton dashboard
    //     return <div>Loading dashboard...</div>; // Or a more sophisticated loading component
    // } // Temporarily commented out loading/auth check

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Dashboard (Demo Access)</h1>
             {/* Placeholder Content */}
             <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Welcome!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This is your dashboard. Normally, access requires login.</p>
                </CardContent>
             </Card>

            {/* Integrate Chatbot Component */}
            <Chatbot />

        </main>
        <Footer />
    </div>
  );
}
