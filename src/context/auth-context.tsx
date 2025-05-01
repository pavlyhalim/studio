
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initialSampleUsers } from "@/lib/sample-data"; // For initial demo state

// --- Traditional Auth Simulation ---
// This simulates API calls to a backend.

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
}

const initialDemoRole: UserRole = 'student'; // Default to student for demo

const getInitialSampleUserId = (role: UserRole): string | null => {
    const user = initialSampleUsers.find(u => u.role === role);
    return user?.id ?? initialSampleUsers[0]?.id ?? null; // Fallback to first user if role match fails
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null); // Use SimpleUser
  const [loading, setLoading] = useState(true); // Start loading until session check is done
  const { toast } = useToast();
  const [demoRole, setDemoRoleInternal] = useState<UserRole>(initialDemoRole);
  const [sampleUserId, setSampleUserId] = useState<string | null>(getInitialSampleUserId(initialDemoRole));
  const [sessionToken, setSessionToken] = useState<string | null>(null); // Simulate session/token

  // Wrap session check in useEffect to run only on the client
  useEffect(() => {
    const checkSession = async () => {
        setLoading(true); // Ensure loading state is true during check
        // Access localStorage only inside useEffect
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                if (response.ok) {
                    const userData: SimpleUser = await response.json();
                    setUser(userData);
                    setSessionToken(storedToken);
                    setDemoRoleInternal(null);
                    setSampleUserId(null);
                    console.log("AuthProvider: Session restored for user:", userData.email);
                } else {
                    localStorage.removeItem('authToken'); // Clear invalid token
                    setUser(null);
                    setSessionToken(null);
                    setDemoRoleInternal(initialDemoRole);
                    setSampleUserId(getInitialSampleUserId(initialDemoRole));
                }
            } catch (error) {
                console.error("AuthProvider: Error checking session:", error);
                localStorage.removeItem('authToken'); // Clear token on error
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
        setLoading(false); // Set loading to false after check completes
    };

    checkSession();
  }, []); // Empty dependency array ensures this runs only once on the client after mount


  // Simplified error handling for API simulation
  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Sign-Out" | "Session Check") => {
    let errorMessage = `An error occurred during ${action}. Please try again.`;
    let title = `${action} Failed`;

    if (error instanceof Error) {
        errorMessage = error.message; // Use message from simulated API error
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    console.error(`${action} Error:`, errorMessage, error); // Log the full error if available

    toast({
        title: title,
        description: errorMessage,
        variant: "destructive",
    });
  };


  const signInWithEmailPassword = async (email: string, pass: string) => {
    setLoading(true);
    try {
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

        setUser(userData);
        setSessionToken(token);
        localStorage.setItem('authToken', token); // Access localStorage safely here (client-side)
        setDemoRoleInternal(null);
        setSampleUserId(null);
        toast({ title: "Successfully signed in." });

    } catch (error: any) {
        handleAuthError(error, "Sign-In");
        setUser(null);
        setSessionToken(null);
        localStorage.removeItem('authToken'); // Access localStorage safely here (client-side)
        // Re-throw the error so the component knows the login failed
        throw error;
    } finally {
        setLoading(false);
    }
  };

 const signUpWithEmailPassword = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
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

        setUser(newUser);
        setSessionToken(token);
        localStorage.setItem('authToken', token); // Access localStorage safely here (client-side)
        setDemoRoleInternal(null);
        setSampleUserId(null);
        toast({ title: "Account created successfully!" });

    } catch (error: any) {
        handleAuthError(error, "Sign-Up");
        setUser(null);
        setSessionToken(null);
        localStorage.removeItem('authToken'); // Access localStorage safely here (client-side)
        // Re-throw the error so the component knows the signup failed
        throw error;
    } finally {
        setLoading(false);
    }
 };


  const signOut = async () => {
    setLoading(true);
    try {
        // Simulate API call to logout endpoint (optional)
        // await fetch('/api/auth/logout', { method: 'POST' });

        setUser(null);
        setSessionToken(null);
        localStorage.removeItem('authToken'); // Access localStorage safely here (client-side)
        setDemoRoleInternal(initialDemoRole);
        setSampleUserId(getInitialSampleUserId(initialDemoRole));
        toast({ title: "Successfully signed out." });
    } catch (error: any) {
      handleAuthError(error, "Sign-Out");
    } finally {
        setLoading(false);
    }
  };

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
        return user.role;
    }
    return demoRole;
  }, [user, demoRole]);

  const value = useMemo(() => ({
    user,
    loading,
    sampleUserId,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    role: currentRole,
    setRole,
  }), [
      user,
      loading,
      sampleUserId,
      currentRole,
      setRole,
      signInWithEmailPassword, // Functions are now stable due to useCallback or being outside
      signUpWithEmailPassword,
      signOut
    ]);


  // Render children directly while loading, initial check happens client-side
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
