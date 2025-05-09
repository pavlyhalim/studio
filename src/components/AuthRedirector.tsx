'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * AuthRedirector watches Firebase Auth state changes and
 * redirects based on authentication status and current route.
 * Disabled automatic redirects since they're now handled directly
 * in the auth functions with window.location.
 */
export default function AuthRedirector() {
  const router = useRouter();

  useEffect(() => {
    // Get current path
    const path = window.location.pathname;
    const isLoginPage = path === '/login' || path === '/signup';
    const isProtectedRoute = path.startsWith('/dashboard') || 
                             path.startsWith('/profile') || 
                             path.startsWith('/settings');
    
    // Subscribe to auth state changes, but don't do automatic redirects anymore
    // This is mostly to protect private routes from unauthenticated access
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user && isProtectedRoute) {
        // Only redirect from protected routes to login if not authenticated
        const redirectPath = encodeURIComponent(path);
        router.push(`/login?redirect=${redirectPath}`);
      }
      // Let the auth functions handle other redirects
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [router]);

  return null; // No UI
}