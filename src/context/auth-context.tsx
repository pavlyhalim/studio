"use client";

import type { User } from "firebase/auth";
import { createContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void; // Allow setting role for demo purposes
  // TODO: Replace setRole with actual role fetching logic in a real app
}

// Initial role for demo purposes when login is bypassed
const initialDemoRole: UserRole = 'student'; // Default to student for demo

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Initialize role state, defaulting for demo if login is bypassed
  const [role, setRoleInternal] = useState<UserRole>(initialDemoRole); // Use internal setter

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // TODO: In a real application, fetch the user's role from your backend/database here
        // For demo, we might keep the manually set role or default to 'student'
        // Example: fetchUserRole(currentUser.uid).then(setRoleInternal);
        // Keeping manually set role for demo:
         console.log("Auth state changed, user logged in, retaining role:", role);
         // Or default if needed: setRoleInternal('student');
      } else {
        // Reset role on sign out or if no user
        setRoleInternal(initialDemoRole); // Reset to default demo role when logged out
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [role]); // Added role to dependency array if needed for fetching based on role state

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // After successful sign-in, Firebase automatically updates the user state via onAuthStateChanged
      // The useEffect hook will handle setting loading to false and potentially fetching the role
       toast({ title: "Successfully signed in with Google." });
       // TODO: Fetch role after sign in
       // fetchUserRole(result.user.uid).then(setRoleInternal);
       // For demo, setting a default role after login:
       setRoleInternal('student'); // Or fetch based on some logic if needed
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "An error occurred during Google Sign-In. Please try again.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is false on error
      setRoleInternal(null); // Reset role on error
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Successfully signed out." });
      // setUser(null); // Firebase handles this via onAuthStateChanged
      // Role is reset by onAuthStateChanged listener
    } catch (error) {
      console.error("Sign Out Error:", error);
       toast({
        title: "Sign Out Failed",
        description: "An error occurred during sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
        // Loading and role state reset is handled by onAuthStateChanged
        // setLoading(false); // Can be removed if onAuthStateChanged reliably sets it
    }
  };

  // Wrapper for setting role, used for demo selector
  const setRole = useCallback((newRole: UserRole) => {
    console.log("Setting role (demo):", newRole);
    setRoleInternal(newRole);
  }, []);


  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    role,
    setRole, // Expose setRole for demo purposes
  };

  // Render children only after initial auth check is complete
  // Or show a global loading indicator
  // if (loading) {
  //   return <div>Loading Application...</div>; // Or a proper loading component
  // }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}