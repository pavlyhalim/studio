
"use client";

import type { User } from "firebase/auth";
import { createContext, useEffect, useState, type ReactNode, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { sampleUsers } from "@/lib/sample-data"; // Import sample users

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
  // TODO: Replace setRole with actual role fetching logic in a real app
}

// Initial role for demo purposes when login is bypassed
const initialDemoRole: UserRole = 'student'; // Default to student for demo

// Find initial sample user based on initial role
const getInitialUserId = (role: UserRole): string | null => {
    const user = sampleUsers.find(u => u.role === role);
    return user?.id ?? null;
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Firebase User
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Initialize role state, defaulting for demo if login is bypassed
  const [role, setRoleInternal] = useState<UserRole>(initialDemoRole); // Use internal setter
  // Sample User ID based on role
  const [userId, setUserId] = useState<string | null>(getInitialUserId(initialDemoRole));


  useEffect(() => {
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
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    // Only re-run if Firebase user state changes (not on manual role change)
  }, []); // Removed role dependency to avoid loop with setRole callback

  const signInWithGoogle = async () => {
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
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "An error occurred during Google Sign-In. Please try again.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is false on error
      setRoleInternal(null); // Reset role on error
      setUserId(null); // Reset userId on error
    }
  };

  const signOut = async () => {
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
  }), [user, userId, loading, signInWithGoogle, signOut, role, setRole]);

  // Render children only after initial auth check is complete
  // Or show a global loading indicator
  // if (loading) {
  //   return <div>Loading Application...</div>; // Or a proper loading component
  // }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
