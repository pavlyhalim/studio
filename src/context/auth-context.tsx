"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  auth, 
  googleProvider
} from "@/lib/firebase";
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/models";
import type { UserRecord } from "@/lib/models";

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

// Define simplified user structure for context
interface SimpleUser {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  photoURL?: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signInWithEmailPassword: (email: string, pass: string) => Promise<boolean>; // Returns true on success, false on failure
  signInWithGoogle: () => Promise<boolean>; // Returns true on success, false on failure
  signUpWithEmailPassword: (name: string, email: string, pass: string) => Promise<boolean>; // Returns true on success, false on failure
  signOut: () => Promise<void>;
  role: UserRole; // Effective role (user's role or demoRole if logged out)
  setRole: (role: UserRole) => void; // Function to set the demoRole when logged out
  userId: string | null; // Added userId for convenience
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until auth state check is done
  const { toast } = useToast();
  const [demoRole, setDemoRole] = useState<UserRole>('student'); // Default demo role

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        
        if (firebaseUser) {
          // User is signed in
          console.log("Auth state changed: User is signed in");
          
          // Get additional user data from Firestore
          const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserRecord;
            // Create the user object with Firestore role
            const userWithRole: SimpleUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              role: userData.role || 'student', // Default to student if missing
              photoURL: firebaseUser.photoURL
            };
            
            setUser(userWithRole);
            
            // Update last login timestamp
            await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          } else {
            // Handle first-time authentication (user in Auth but not in Firestore)
            console.log("New user logged in but no Firestore record yet");
            
            // Create a basic user document
            const newUserData: Partial<UserRecord> = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Firebase User',
              email: firebaseUser.email?.toLowerCase(),
              role: 'student', // Default role
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: serverTimestamp() as unknown as number,
              lastLogin: serverTimestamp() as unknown as number
            };
            
            await setDoc(userDocRef, newUserData);
            
            // Set the user state with the default role
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              role: 'student', // Default to student for new users
              photoURL: firebaseUser.photoURL
            });
            
            // Welcome the new user
            toast({ 
              title: "Welcome to ALANT Lite!", 
              description: "Your account has been created successfully." 
            });
          }
        } else {
          // User is signed out
          console.log("Auth state changed: User is signed out");
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  // Simplified error handling for Firebase auth
  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Sign-Out" | "Session Check") => {
    let errorMessage = `An error occurred during ${action}. Please try again.`;
    let title = `${action} Failed`;

    // Parse Firebase error codes to user-friendly messages
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. It should be at least 6 characters.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid login credentials.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
          break;
        default:
          errorMessage = `Authentication error: ${error.message || 'Unknown error'}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Log the error for debugging
    console.error(`${action} Error:`, error.code, errorMessage, error);

    // Show toast notification
    toast({
      title: title,
      description: errorMessage,
      variant: "destructive",
    });
  };

  const signInWithEmailPassword = useCallback(async (email: string, pass: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Use Firebase auth for sign-in
      const userCredential = await firebaseSignInWithEmailPassword(auth, email, pass);
      
      // Success feedback is handled by the auth state change handler
      toast({ title: "Successfully signed in." });
      
      return true;
    } catch (error: any) {
      handleAuthError(error, "Sign-In");
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Use Firebase auth for Google sign-in
      await signInWithPopup(auth, googleProvider);
      
      // Success feedback is handled by the auth state change handler
      
      return true;
    } catch (error: any) {
      handleAuthError(error, "Sign-In");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmailPassword = useCallback(async (name: string, email: string, pass: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Use Firebase auth for sign-up
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Set the display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      // Note: Handled in the auth state change listener now
      
      // Success feedback is handled by the auth state change handler
      
      return true;
    } catch (error: any) {
      handleAuthError(error, "Sign-Up");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use Firebase auth for sign-out
      await firebaseSignOut(auth);
      
      // Success feedback
      toast({ title: "Successfully signed out." });
      
      // Reset demo role on sign out
      setDemoRole('student');
    } catch (error: any) {
      handleAuthError(error, "Sign-Out");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Function to set the demo role, only works if user is not logged in
  const handleSetRole = useCallback((role: UserRole) => {
    if (!user) {
      setDemoRole(role);
    } else {
      console.warn("Cannot set demo role while logged in.");
      // Inform user that they need to log out to change demo role
      toast({ 
        title: "Cannot Change Role", 
        description: "You need to log out to change the demo role.",
        variant: "default"
      });
    }
  }, [user, toast]);

  // Role is now derived from the authenticated user OR the demo role
  const currentRole = useMemo(() => {
    return user?.role ?? demoRole; // Prioritize user's actual role
  }, [user, demoRole]);

  const currentUserId = useMemo(() => {
    return user?.id ?? null; // Use user's ID if logged in
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    signInWithEmailPassword,
    signInWithGoogle,
    signUpWithEmailPassword,
    signOut,
    role: currentRole,
    setRole: handleSetRole,
    userId: currentUserId,
  }), [
    user,
    loading,
    currentRole,
    currentUserId,
    handleSetRole,
    signInWithEmailPassword,
    signInWithGoogle,
    signUpWithEmailPassword,
    signOut
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}