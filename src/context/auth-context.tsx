
"use client";

import type { User } from "firebase/auth";
import { createContext, useEffect, useState, type ReactNode, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; // Import potentially null values
import { useToast } from "@/hooks/use-toast";
import { initialSampleUsers } from "@/lib/sample-data"; // Import initial sample users

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

interface AuthContextType {
  user: User | null; // Firebase Auth user
  userId: string | null; // Sample User ID for demo
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void; // Allow setting role for demo purposes
  isFirebaseReady: boolean; // Flag indicating if Firebase Auth is likely ready
  // TODO: Replace setRole with actual role fetching logic in a real app
}

// Initial role for demo purposes when login is bypassed
const initialDemoRole: UserRole = 'student'; // Default to student for demo

// Find initial sample user based on initial role
const getInitialUserId = (role: UserRole): string | null => {
    const user = initialSampleUsers.find(u => u.role === role); // Use initialSampleUsers
    return user?.id ?? null;
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Firebase User
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [role, setRoleInternal] = useState<UserRole>(initialDemoRole); // Use internal setter
  const [userId, setUserId] = useState<string | null>(getInitialUserId(initialDemoRole));
  // isFirebaseReady checks if the config values seem present, not if initialization succeeded
  const isFirebaseConfigPresent = useMemo(() => !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY', []);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false); // Track successful auth init


  useEffect(() => {
    // Only subscribe if Firebase Auth object exists (meaning initialization was attempted)
    if (!auth) {
        console.warn("AuthProvider: Firebase Auth object is null. Skipping auth state listener. This likely means Firebase initialization failed.");
        setIsFirebaseAuthReady(false);
        setLoading(false); // Set loading to false as we can't wait for auth
        // Retain initial demo role/user if Firebase isn't ready
        setRoleInternal(initialDemoRole);
        setUserId(getInitialUserId(initialDemoRole));
        return; // Exit early
    }

    console.log("AuthProvider: Firebase Auth object exists, attempting to set up listener.");
    setIsFirebaseAuthReady(true); // Auth object exists, assume ready for listener setup

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // In a real app, fetch role and userId from backend based on currentUser.uid
        // For demo, we retain the manually set role and derive userId
        const derivedUserId = getInitialUserId(role);
        setUserId(derivedUserId);
        console.log("Auth state changed, user logged in, retaining role:", role, "setting userId:", derivedUserId);
        // Example: fetchUserData(currentUser.uid).then(data => { setRoleInternal(data.role); setUserId(data.id); });
      } else {
        // Reset role and userId on sign out or if no user
        setRoleInternal(initialDemoRole); // Reset to default demo role
        setUserId(getInitialUserId(initialDemoRole)); // Reset userId based on default demo role
        console.log("Auth state changed, no user logged in, resetting role and userId.");
      }
    }, (error) => { // Add error handler for onAuthStateChanged
        console.error("Error in onAuthStateChanged listener:", error);
        setIsFirebaseAuthReady(false); // Mark auth as not ready on listener error
        setLoading(false); // Ensure loading is false on error
        setUser(null); // Reset user state on listener error
        setRoleInternal(initialDemoRole); // Reset role
        setUserId(getInitialUserId(initialDemoRole)); // Reset user ID
        toast({
            title: "Authentication Error",
            description: "Could not verify login status. Please try refreshing.",
            variant: "destructive",
        });
    });

    // Cleanup subscription on unmount
    return () => {
        console.log("Auth provider unmounting, unsubscribing from auth state changes.");
        unsubscribe();
    };
    // Rerun if role changes (to update derived userId) or if auth object changes (unlikely but safe)
  }, [role, auth]); // Keep auth in dependency array

  const signInWithGoogle = async () => {
    // Check if auth and provider objects are available
    if (!auth || !googleProvider) {
        console.error("Google Sign-In Error: Firebase Auth or Google Provider is null. Initialization likely failed.");
        toast({
            title: "Sign-In Unavailable",
            description: isFirebaseConfigPresent ? "Firebase Authentication failed to initialize. Check console." : "Firebase is not configured correctly. Please update .env.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Firebase automatically updates user via onAuthStateChanged
       toast({ title: "Successfully signed in with Google." });
       // TODO: Fetch role & userId after sign in from backend
       // fetchUserData(result.user.uid).then(data => { setRoleInternal(data.role); setUserId(data.id); });
       // For demo, setting a default role & userId after login:
       const demoRole = 'student'; // Default role after login for demo
       setRoleInternal(demoRole);
       setUserId(getInitialUserId(demoRole));
    } catch (error: any) { // Catch specific error type if known, else 'any'
        let errorMessage = "An error occurred during Google Sign-In. Please try again.";
        // Handle specific Firebase auth errors if needed
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in cancelled. Please try again.";
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = "Network error during sign-in. Check your connection.";
        } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
            errorMessage = "Sign-in popup blocked or cancelled. Please allow popups and try again.";
        } else if (error.code === 'auth/internal-error') {
             errorMessage = "An internal authentication error occurred. Please try again later.";
        } else if (error.code === 'auth/unauthorized-domain') {
             errorMessage = "This domain is not authorized for OAuth operations for your Firebase project. Check your Firebase Console > Authentication > Settings > Authorized domains.";
        }
        console.error("Google Sign-In Error:", error.code, error.message);
        toast({
            title: "Google Sign-In Failed",
            description: errorMessage,
            variant: "destructive",
        });
        // setLoading(false); // Don't set loading false here, let onAuthStateChanged handle it
    } finally {
        // setLoading(false) is handled by onAuthStateChanged listener typically,
        // but set it false if the sign-in promise itself fails and doesn't trigger the listener
        // However, the listener should eventually trigger even on failure to clear user state.
        // It's safer to rely on the listener. If loading gets stuck, investigate the listener.
    }
  };

  const signOut = async () => {
     // Check if auth object is available
     if (!auth) {
        console.error("Sign Out Error: Firebase Auth is null. Initialization likely failed.");
        toast({
            title: "Sign-Out Unavailable",
            description: isFirebaseConfigPresent ? "Firebase Authentication failed to initialize. Check console." : "Firebase is not configured correctly.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Successfully signed out." });
      // User, role, and userId reset is handled by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign Out Error:", error);
       toast({
        title: "Sign Out Failed",
        description: "An error occurred during sign out. Please try again.",
        variant: "destructive",
      });
      // setLoading(false); // Let onAuthStateChanged handle loading state
    }
    // Loading and state reset is handled by onAuthStateChanged
  };

  // Wrapper for setting role, used for demo selector
  // Also updates the sample userId
  const setRole = useCallback((newRole: UserRole) => {
    const newUserId = getInitialUserId(newRole);
    console.log("Setting role (demo):", newRole, "setting userId:", newUserId);
    setRoleInternal(newRole);
    setUserId(newUserId); // Update userId when role changes
  }, []);


  const value = useMemo(() => ({
    user,
    userId, // Expose the sample userId
    loading,
    signInWithGoogle,
    signOut,
    role,
    setRole, // Expose setRole for demo purposes
    isFirebaseReady: isFirebaseAuthReady, // Expose Firebase auth readiness state
  }), [user, userId, loading, role, setRole, isFirebaseAuthReady]); // Include dependencies used in useMemo

  // Render children only after initial auth check is complete (or determined impossible)
   // Still show loading until the initial auth state check completes
   if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            {/* Use a loading component */}
            Loading Application...
        </div>
    );
   }

  // Render children once loading is false
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
