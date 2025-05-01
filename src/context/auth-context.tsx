"use client";

import type { User } from "firebase/auth";
import { createContext, useEffect, useState, type ReactNode, useCallback, useMemo } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword, // Import for sign-up
    signInWithEmailAndPassword, // Import for sign-in
    updateProfile // Import to update profile (e.g., displayName)
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, type Timestamp } from "firebase/firestore"; // Import Firestore functions
import { auth, googleProvider, db } from "@/lib/firebase"; // Import db
import { useToast } from "@/hooks/use-toast";
import { initialSampleUsers } from "@/lib/sample-data"; // For initial demo state

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

// Define Firestore user data structure
interface UserData {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    createdAt: Timestamp;
}

interface AuthContextType {
  user: User | null; // Firebase Auth user
  userData: UserData | null; // User data from Firestore
  loading: boolean;
  // Rename userId to sampleUserId for clarity
  sampleUserId: string | null; // Sample User ID ONLY for demo purposes when not logged in
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailPassword: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void; // Allow setting role for demo purposes when NOT logged in
  isFirebaseReady: boolean; // Flag indicating if Firebase Auth is likely ready
}

// Initial role for demo purposes when login is bypassed
const initialDemoRole: UserRole = 'student'; // Default to student for demo

// Find initial sample user based on initial role
const getInitialSampleUserId = (role: UserRole): string | null => {
    const user = initialSampleUsers.find(u => u.role === role); // Use initialSampleUsers
    return user?.id ?? null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Firebase User
  const [userData, setUserData] = useState<UserData | null>(null); // Firestore User Data
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Internal state for demo role (used when no user is logged in)
  const [demoRole, setDemoRoleInternal] = useState<UserRole>(initialDemoRole);
  // Sample user ID for demo state when not logged in
  const [sampleUserId, setSampleUserId] = useState<string | null>(getInitialSampleUserId(initialDemoRole));
  // isFirebaseReady checks if the config values seem present, not if initialization succeeded
  const isFirebaseConfigPresent = useMemo(() => !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY', []);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false); // Track successful auth init

  // Function to fetch user data from Firestore
  const fetchUserData = useCallback(async (firebaseUser: User) => {
     if (!db) {
        console.warn("AuthProvider: Firestore (db) is null. Cannot fetch user data.");
        setUserData(null); // Ensure userData is null if db isn't available
        return null;
     }
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const fetchedData = userDocSnap.data() as UserData;
          setUserData(fetchedData);
          console.log("Fetched user data from Firestore:", fetchedData);
          return fetchedData;
        } else {
          console.warn(`No user data found in Firestore for UID: ${firebaseUser.uid}`);
          setUserData(null); // No data found
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        setUserData(null); // Error fetching data
        toast({
            title: "Error",
            description: "Could not load user profile data.",
            variant: "destructive",
        });
        return null;
      }
  }, [toast]); // Add toast as dependency

  useEffect(() => {
    if (!auth) {
        console.warn("AuthProvider: Firebase Auth object is null. Skipping auth state listener.");
        setIsFirebaseAuthReady(false);
        setLoading(false);
        // Retain initial demo role/user if Firebase isn't ready
        setDemoRoleInternal(initialDemoRole);
        setSampleUserId(getInitialSampleUserId(initialDemoRole));
        setUserData(null); // Ensure userData is null
        return;
    }

    console.log("AuthProvider: Firebase Auth object exists, attempting to set up listener.");
    setIsFirebaseAuthReady(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is signed in, fetch their data from Firestore
        setLoading(true); // Set loading while fetching Firestore data
        await fetchUserData(currentUser);
        setLoading(false);
        // Clear demo state when user is logged in
        setDemoRoleInternal(null);
        setSampleUserId(null);
      } else {
        // User is signed out, reset user data and set demo state
        setUserData(null);
        setDemoRoleInternal(initialDemoRole); // Reset to default demo role
        setSampleUserId(getInitialSampleUserId(initialDemoRole)); // Reset sample userId
        setLoading(false); // Set loading false as auth state is determined
        console.log("Auth state changed, no user logged in, resetting role and userId.");
      }
    }, (error) => {
        console.error("Error in onAuthStateChanged listener:", error);
        setIsFirebaseAuthReady(false);
        setLoading(false);
        setUser(null);
        setUserData(null); // Clear user data on error
        setDemoRoleInternal(initialDemoRole);
        setSampleUserId(getInitialSampleUserId(initialDemoRole));
        toast({
            title: "Authentication Error",
            description: "Could not verify login status. Please try refreshing.",
            variant: "destructive",
        });
    });

    return () => {
        console.log("Auth provider unmounting, unsubscribing from auth state changes.");
        unsubscribe();
    };
  }, [fetchUserData, toast, auth]); // Add auth dependency

  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Google Sign-In") => {
    let errorMessage = `An error occurred during ${action}. Please try again.`;
    let title = `${action} Failed`;

    // Customize error messages based on Firebase error codes
    switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
        case 'auth/popup-blocked':
            errorMessage = `${action} cancelled or popup blocked. Please allow popups and try again.`;
            break;
        case 'auth/network-request-failed':
            errorMessage = `Network error during ${action}. Check your connection.`;
            break;
        case 'auth/internal-error':
            errorMessage = `An internal authentication error occurred during ${action}. Please try again later.`;
            break;
        case 'auth/unauthorized-domain':
             errorMessage = "This domain is not authorized for authentication. Please contact support or check the Firebase Console.";
             break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
             errorMessage = "Invalid email or password.";
             title = "Sign-In Failed";
             break;
        case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
        case 'auth/email-already-in-use':
            errorMessage = "This email address is already registered. Please try logging in.";
            title = "Sign-Up Failed";
            break;
        case 'auth/weak-password':
            errorMessage = "Password is too weak. Please choose a stronger password (at least 6 characters).";
            title = "Sign-Up Failed";
            break;
        // Add more specific Firebase error codes as needed
    }
    console.error(`${action} Error:`, error.code, error.message, error); // Log the full error
    toast({
        title: title,
        description: errorMessage,
        variant: "destructive",
    });
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        handleAuthError({ code: 'auth/internal-error', message: 'Firebase Auth/Provider not init.' }, "Google Sign-In");
        return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Check if user data exists in Firestore, if not, create it
      if (result.user && db) {
        const userDocRef = doc(db, "users", result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          // Create Firestore document for new Google user
          const newUser: UserData = {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            role: 'student', // Default role for new sign-ups
            createdAt: serverTimestamp() as Timestamp // Use server timestamp
          };
          await setDoc(userDocRef, newUser);
          console.log("Created Firestore document for new Google user:", newUser);
          setUserData(newUser); // Optimistically update local state
        } else {
           // Data already exists, fetch it (handled by onAuthStateChanged)
           // await fetchUserData(result.user); // Refetch to ensure data is fresh
        }
      }
       toast({ title: "Successfully signed in with Google." });
       // Firestore data fetching is handled by onAuthStateChanged
    } catch (error: any) {
        handleAuthError(error, "Google Sign-In");
    } finally {
         setLoading(false); // Set loading false after attempt, listener will handle final state
    }
  };

  const signInWithEmailPassword = async (email: string, pass: string) => {
     if (!auth) {
        handleAuthError({ code: 'auth/internal-error', message: 'Firebase Auth not init.' }, "Sign-In");
        return;
    }
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle user state and Firestore data fetching
        toast({ title: "Successfully signed in." });
    } catch (error: any) {
        handleAuthError(error, "Sign-In");
    } finally {
        setLoading(false); // Set loading false after attempt
    }
  };

 const signUpWithEmailPassword = async (name: string, email: string, pass: string) => {
     if (!auth || !db) {
        handleAuthError({ code: 'auth/internal-error', message: 'Firebase Auth or DB not init.' }, "Sign-Up");
        return;
    }
    setLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        // Update Firebase Auth profile display name
        await updateProfile(firebaseUser, { displayName: name });

        // Create user document in Firestore
        const newUser: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: name, // Use the provided name
            role: 'student', // Default role for new sign-ups
            createdAt: serverTimestamp() as Timestamp // Use server timestamp
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);

        // Update local state (optional, as onAuthStateChanged should handle it)
        // setUser(firebaseUser); // Update auth user
        // setUserData(newUser); // Update Firestore data

        toast({ title: "Account created successfully!" });
        // Let onAuthStateChanged handle the final state update including userData fetch
    } catch (error: any) {
        handleAuthError(error, "Sign-Up");
    } finally {
        setLoading(false);
    }
 };


  const signOut = async () => {
     if (!auth) {
        console.error("Sign Out Error: Firebase Auth is null.");
        // Don't toast here, maybe rely on visual feedback or ensure auth init first
        return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Successfully signed out." });
      // User, userData, role, and sampleUserId reset is handled by onAuthStateChanged
    } catch (error: any) {
      handleAuthError(error, "Sign-Out"); // Generic sign-out error
    } finally {
        setLoading(false); // Ensure loading is set false
    }
  };

  // Wrapper for setting DEMO role (when not logged in)
  // Also updates the sample userId
  const setRole = useCallback((newRole: UserRole) => {
    // Only allow setting demo role if user is not logged in
    if (!user) {
        const newSampleUserId = getInitialSampleUserId(newRole);
        console.log("Setting DEMO role:", newRole, "setting sampleUserId:", newSampleUserId);
        setDemoRoleInternal(newRole);
        setSampleUserId(newSampleUserId); // Update sampleUserId when demo role changes
    } else {
        console.warn("Cannot set demo role while user is logged in.");
        // In a real app, role changes for logged-in users would happen via backend/admin actions
    }
  }, [user]); // Re-evaluate if user logs in/out

  // Determine the current effective role
  const currentRole = useMemo(() => {
    if (user && userData) {
        return userData.role; // Use Firestore role if logged in and data exists
    }
    return demoRole; // Use demo role if not logged in
  }, [user, userData, demoRole]);

  const value = useMemo(() => ({
    user,
    userData,
    loading,
    sampleUserId, // Expose the sample userId
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    role: currentRole, // Use the determined current role
    setRole, // Expose setRole for demo purposes (only works when logged out)
    isFirebaseReady: isFirebaseAuthReady, // Expose Firebase auth readiness state
  }), [
      user,
      userData,
      loading,
      sampleUserId,
      signInWithGoogle,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      signOut,
      currentRole,
      setRole,
      isFirebaseAuthReady
    ]); // Include all dependencies

  // Render loading indicator ONLY during the very initial auth check
  if (loading && !user && !userData) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            {/* Replace with a proper loading component if available */}
            Loading Application...
        </div>
    );
  }

  // Render children once initial loading is false
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
