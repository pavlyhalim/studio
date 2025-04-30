
"use client";

import type { User } from "firebase/auth";
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Add role state and management if needed for role-based access control
  // role: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // const [role, setRole] = useState<string | null>(null); // Add role state if needed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // If implementing roles, fetch user role here after authentication
      // e.g., fetchUserRole(currentUser?.uid).then(setRole);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Successfully signed in with Google." });
      // After successful sign-in, Firebase automatically updates the user state via onAuthStateChanged
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "An error occurred during Google Sign-In. Please try again.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading will be set to false by the onAuthStateChanged listener
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Successfully signed out." });
      // setUser(null); // Firebase handles this via onAuthStateChanged
      // setRole(null); // Reset role on sign out if needed
    } catch (error) {
      console.error("Sign Out Error:", error);
       toast({
        title: "Sign Out Failed",
        description: "An error occurred during sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
        setLoading(false); // Ensure loading is false after sign out attempt
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    // role, // Provide role if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
