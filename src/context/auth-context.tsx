"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

// Define our application's user structure
interface AppUser {
  id: string; // Firebase UID
  email: string | null;
  name: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithEmailPassword: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmailPassword: (name: string, email: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  role: UserRole; // Effective role (user's role or demoRole if logged out)
  setRole: (role: UserRole) => void; // Function to set the demoRole when logged out
  userId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [demoRole, setDemoRole] = useState<UserRole>('student');

  // Firebase error handler
  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Sign-Out" | "Session Management") => {
    let title = `${action} Failed`;
    let description = "An unexpected error occurred. Please try again.";

    if (error && error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                description = "Invalid email or password.";
                break;
            case 'auth/email-already-in-use':
                description = "This email address is already in use.";
                break;
            case 'auth/weak-password':
                description = "Password is too weak. It should be at least 6 characters.";
                break;
            case 'auth/invalid-email':
                description = "The email address is not valid.";
                break;
            default:
                description = error.message || description;
        }
    } else if (error instanceof Error) {
        description = error.message;
    }

    console.error(`${action} Error:`, error);
    toast({ title, description, variant: "destructive" });
  };

  // Listener for Firebase authentication state changes
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDataFromFirestore = userDocSnap.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userDataFromFirestore.name, // Prefer displayName, fallback to Firestore
              role: userDataFromFirestore.role || 'student', // Default to student if role not in Firestore
            });
          } else {
            // This case might happen if Firestore document creation failed during signup
            // Or if it's a new sign-in method for an existing Firebase user without a profile yet
            console.warn(`No Firestore profile found for user ${firebaseUser.uid}. Using Firebase data only.`);
            // Creating a default profile here might be an option
            // For now, set with available Firebase data and a default role
            const defaultRole = 'student';
            const defaultName = firebaseUser.displayName || "New User";
            await setDoc(doc(db, "users", firebaseUser.uid), {
                name: defaultName,
                email: firebaseUser.email,
                role: defaultRole,
                createdAt: new Date().toISOString(),
            });
            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: defaultName,
                role: defaultRole,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback to Firebase data if Firestore fetch fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            role: 'student', // Fallback role
          });
          handleAuthError(error, "Session Management");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  const signUpWithEmailPassword = useCallback(
    async (name: string, email: string, pass: string): Promise<boolean> => {
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        // Update Firebase profile display name
        await updateProfile(firebaseUser, { displayName: name });

        // Create user document in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(userDocRef, {
          name: name,
          email: firebaseUser.email,
          role: 'student', // Default role for new users
          createdAt: new Date().toISOString(), // Optional: timestamp
        });

        // User state will be set by onAuthStateChanged listener
        toast({ title: "Account created successfully!" });
        setLoading(false);
        return true;
      } catch (error: any) {
        handleAuthError(error, "Sign-Up");
        setLoading(false);
        return false;
      }
    }, [toast]
  );

  const signInWithEmailPassword = useCallback(
    async (email: string, pass: string): Promise<boolean> => {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        // User state will be set by onAuthStateChanged listener
        toast({ title: "Successfully signed in." });
        setLoading(false);
        return true;
      } catch (error: any) {
        handleAuthError(error, "Sign-In");
        setLoading(false);
        return false;
      }
    }, [toast]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // User state will be set to null by onAuthStateChanged listener
      toast({ title: "Successfully signed out." });
      setDemoRole('student'); // Reset demo role on sign out
    } catch (error: any) {
      handleAuthError(error, "Sign-Out");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSetRole = useCallback((newRole: UserRole) => {
    if (!user) {
      setDemoRole(newRole);
    } else {
      console.warn("Cannot set demo role while logged in.");
    }
  }, [user]);

  const currentRole = useMemo(() => user?.role ?? demoRole, [user, demoRole]);
  const currentUserId = useMemo(() => user?.id ?? null, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    role: currentRole,
    setRole: handleSetRole,
    userId: currentUserId,
  }), [
    user, loading, currentRole, currentUserId,
    signInWithEmailPassword, signUpWithEmailPassword, signOut, handleSetRole
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
