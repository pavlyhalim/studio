
"use client"; // Required for client-side hooks and logic

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Loader2 } from 'lucide-react';

// Set to true to enforce login for dashboard access
const REQUIRE_LOGIN = true;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If login is required, loading is finished, and there's no user, redirect to login
    if (REQUIRE_LOGIN && !loading && !user) {
      router.push('/login?redirect=/dashboard'); // Redirect back to dashboard after login
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication (still useful even if not redirecting)
  if (loading && REQUIRE_LOGIN) { // Only show full page loader if login is required
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If login is required and we finished loading but there's still no user, return null (redirect is happening)
  if (REQUIRE_LOGIN && !loading && !user) {
      return null;
  }

  // Render the dashboard layout if login is not required OR if user is authenticated
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Keep the main navbar */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading && !REQUIRE_LOGIN ? ( // Show inline loader if demo mode is loading
             <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
             </div>
        ) : (
            children // Page content will be rendered here
        )}
      </main>
      <Footer /> {/* Keep the main footer */}
    </div>
  );
}
