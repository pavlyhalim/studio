"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initialSampleUsers } from "@/lib/sample-data"; // For initial demo state

// --- Traditional Auth Simulation ---
// This replaces Firebase Auth. It simulates API calls.
// In a real app, these would call your backend API.

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

// Define simplified user structure for context
interface SimpleUser {
    id: string;
    email: string | null;
    name: string | null;
    role: UserRole; // Role is determined by demo logic or fetched from API
}

interface AuthContextType {
  user: SimpleUser | null; // Use SimpleUser type
  loading: boolean;
  sampleUserId: string | null; // Sample User ID for demo when logged out
  signInWithEmailPassword: (email: string, pass: string) => Promise<void>;
  signUpWithEmailPassword: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void; // Allow setting demo role when logged out
  // isFirebaseReady is removed
}

const initialDemoRole: UserRole = 'student'; // Default to student for demo

const getInitialSampleUserId = (role: UserRole): string | null => {
    const user = initialSampleUsers.find(u => u.role === role);
    return user?.id ?? null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock Users (Replace with actual DB in real backend) ---
// Store mock users in memory for simulation purposes
const mockUsersDb = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: UserRole }>();
// Add initial sample users to the mock DB (passwords are NOT real/hashed properly)
initialSampleUsers.forEach(u => {
    mockUsersDb.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: `hashed_${u.id}_password`, // Simulate a hash
        role: u.role,
    });
});
// ------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null); // Use SimpleUser
  const [loading, setLoading] = useState(true); // Still useful for API call simulation
  const { toast } = useToast();
  const [demoRole, setDemoRoleInternal] = useState<UserRole>(initialDemoRole);
  const [sampleUserId, setSampleUserId] = useState<string | null>(getInitialSampleUserId(initialDemoRole));
  const [sessionToken, setSessionToken] = useState<string | null>(null); // Simulate session/token

  // Simulate checking for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
        setLoading(true);
        // Simulate checking localStorage or cookie for a token
        const storedToken = localStorage.getItem('authToken'); // Example storage
        if (storedToken) {
            try {
                // Simulate API call to validate token and get user data
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                if (response.ok) {
                    const userData: SimpleUser = await response.json();
                    setUser(userData);
                    setSessionToken(storedToken);
                    setDemoRoleInternal(null); // Clear demo state
                    setSampleUserId(null);
                    console.log("AuthProvider: Session restored for user:", userData.email);
                } else {
                    // Token invalid or expired
                    localStorage.removeItem('authToken');
                    setUser(null);
                    setSessionToken(null);
                    setDemoRoleInternal(initialDemoRole);
                    setSampleUserId(getInitialSampleUserId(initialDemoRole));
                }
            } catch (error) {
                console.error("AuthProvider: Error checking session:", error);
                localStorage.removeItem('authToken');
                setUser(null);
                setSessionToken(null);
                 setDemoRoleInternal(initialDemoRole);
                 setSampleUserId(getInitialSampleUserId(initialDemoRole));
            }
        } else {
             // No token found, set initial demo state
             setUser(null);
             setSessionToken(null);
             setDemoRoleInternal(initialDemoRole);
             setSampleUserId(getInitialSampleUserId(initialDemoRole));
        }
        setLoading(false);
    };
    checkSession();
  }, []);

  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Sign-Out" | "Session Check") => {
    // Simplified error handling for simulation
    let errorMessage = `An error occurred during ${action}. Please try again.`;
    if (error instanceof Error) {
        errorMessage = error.message; // Use message from simulated API error
    }
    console.error(`${action} Error:`, error);
    toast({
        title: `${action} Failed`,
        description: errorMessage,
        variant: "destructive",
    });
  };

  // Removed signInWithGoogle

  const signInWithEmailPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
        // Simulate API call
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const { token, user: userData } = await response.json();

        // Simulate successful login
        setUser(userData);
        setSessionToken(token);
        localStorage.setItem('authToken', token); // Store token (insecure simulation)
        setDemoRoleInternal(null); // Clear demo state
        setSampleUserId(null);
        toast({ title: "Successfully signed in." });

    } catch (error: any) {
        handleAuthError(error, "Sign-In");
        setUser(null); // Ensure user is null on error
        setSessionToken(null);
        localStorage.removeItem('authToken');
    } finally {
        setLoading(false);
    }
  };

 const signUpWithEmailPassword = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
        // Simulate API call
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Sign-up failed');
        }

        const { token, user: newUser } = await response.json();

        // Simulate successful signup and login
        setUser(newUser);
        setSessionToken(token);
        localStorage.setItem('authToken', token); // Store token (insecure simulation)
         setDemoRoleInternal(null); // Clear demo state
         setSampleUserId(null);
        toast({ title: "Account created successfully!" });

    } catch (error: any) {
        handleAuthError(error, "Sign-Up");
         setUser(null); // Ensure user is null on error
         setSessionToken(null);
         localStorage.removeItem('authToken');
    } finally {
        setLoading(false);
    }
 };


  const signOut = async () => {
    setLoading(true);
    try {
        // Simulate API call to logout endpoint (optional, could just clear client-side)
        // await fetch('/api/auth/logout', { method: 'POST' });

        // Clear client-side session
        setUser(null);
        setSessionToken(null);
        localStorage.removeItem('authToken'); // Remove token
        setDemoRoleInternal(initialDemoRole); // Reset demo state
        setSampleUserId(getInitialSampleUserId(initialDemoRole));
        toast({ title: "Successfully signed out." });
    } catch (error: any) {
      handleAuthError(error, "Sign-Out");
    } finally {
        setLoading(false);
    }
  };

  // Set demo role logic remains the same
  const setRole = useCallback((newRole: UserRole) => {
    if (!user) {
        const newSampleUserId = getInitialSampleUserId(newRole);
        console.log("Setting DEMO role:", newRole, "setting sampleUserId:", newSampleUserId);
        setDemoRoleInternal(newRole);
        setSampleUserId(newSampleUserId);
    } else {
        console.warn("Cannot set demo role while user is logged in.");
    }
  }, [user]);

  const currentRole = useMemo(() => {
    if (user) {
        return user.role; // Use role from logged-in user object
    }
    return demoRole; // Use demo role if not logged in
  }, [user, demoRole]);

  const value = useMemo(() => ({
    user,
    // userData is removed, use `user` which now includes role etc.
    loading,
    sampleUserId,
    // signInWithGoogle is removed
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    role: currentRole,
    setRole,
    // isFirebaseReady is removed
  }), [
      user,
      loading,
      sampleUserId,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      signOut,
      currentRole,
      setRole,
    ]);

  // Render loading indicator only during initial session check
  // Use a simpler loading indicator
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            Loading Application...
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
