
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
  const isFirebaseReady = useMemo(() => !!auth && !!googleProvider, []); // Check if Firebase services are loaded


  useEffect(() => {
    // Only subscribe if Firebase Auth is initialized
    if (!auth) {
        console.warn("AuthProvider: Firebase Auth is not initialized. Skipping auth state listener.");
        setLoading(false); // Set loading to false as we can't wait for auth
        // Retain initial demo role/user if Firebase isn't ready
        setRoleInternal(initialDemoRole);
        setUserId(getInitialUserId(initialDemoRole));
        return; // Exit early
    }

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
      }
    }, (error) => { // Add error handler for onAuthStateChanged
        console.error("Error in onAuthStateChanged listener:", error);
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
    return () => unsubscribe();
    // Rerun if role changes (to update derived userId) or if auth becomes available later (though unlikely with current setup)
  }, [role, auth]); // Include auth in dependency array

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        console.error("Google Sign-In Error: Firebase Auth or Google Provider not initialized.");
        toast({
            title: "Sign-In Unavailable",
            description: "Firebase is not configured correctly. Please contact support.",
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
        }
        console.error("Google Sign-In Error:", error.code, error.message);
        toast({
            title: "Google Sign-In Failed",
            description: errorMessage,
            variant: "destructive",
        });
        setLoading(false); // Ensure loading is false on error
        // Let onAuthStateChanged handle resetting role/userId if login truly fails
    } finally {
        // setLoading(false) is handled by onAuthStateChanged listener
    }
  };

  const signOut = async () => {
     if (!auth) {
        console.error("Sign Out Error: Firebase Auth not initialized.");
        toast({
            title: "Sign-Out Unavailable",
            description: "Firebase is not configured correctly.",
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
      // Ensure loading is false even on error, though onAuthStateChanged should handle it
      setLoading(false);
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
    isFirebaseReady, // Expose Firebase readiness state
  }), [user, userId, loading, role, setRole, isFirebaseReady]); // Include dependencies used in useMemo

  // Render children only after initial auth check is complete (or determined impossible)
   if (loading) { // Show loading only while the initial check is happening
    // You might want a more sophisticated loading screen here
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            {/* Consider using a full-page loading component */}
            Loading Application...
        </div>
    );
   }

  // Render children once loading is false
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
