"use client"; // Required for client-side hooks and logic

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard'); // Redirect back to dashboard after login
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, render the dashboard layout
  if (user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Keep the main navbar */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children} {/* Page content will be rendered here */}
        </main>
        <Footer /> {/* Keep the main footer */}
      </div>
    );
  }

  // If not loading and no user (should be redirecting, but return null as fallback)
  return null;
}
