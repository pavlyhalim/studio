'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * AuthRedirector watches Firebase Auth state changes and
 * redirects to /dashboard when a user signs in,
 * or to /login when the user signs out.
 *
 * This is a client component and should be included in your root layout.
 */
export default function AuthRedirector() {
  const router = useRouter();

  useEffect(() => {
    // If already signed in, redirect immediately
    if (auth.currentUser) {
      router.push('/dashboard');
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [router]);

  return null; // No UI
}
