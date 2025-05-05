
"use client";

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { mockUsersDb, type User } from "@/lib/sample-data"; // Use mock DB

// --- Traditional Auth Simulation ---
// This simulates API calls to a backend.

// Define possible roles
export type UserRole = 'student' | 'professor' | 'admin' | null;

// Define simplified user structure for context (matches API response)
interface SimpleUser extends Omit<User, 'passwordHash'> {}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signInWithEmailPassword: (email: string, pass: string) => Promise<boolean>; // Returns true on success, false on failure
  signUpWithEmailPassword: (name: string, email: string, pass: string) => Promise<boolean>; // Returns true on success, false on failure
  signOut: () => Promise<void>;
  role: UserRole; // Effective role (user's role or demoRole if logged out)
  setRole: (role: UserRole) => void; // Function to set the demoRole when logged out
  userId: string | null; // Added userId for convenience
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until session check is done
  const { toast } = useToast();
  const [sessionToken, setSessionToken] = useState<string | null>(null); // Simulate session/token
  const [demoRole, setDemoRole] = useState<UserRole>('student'); // Default demo role

  // --- Client-Side Only Effect for Session Check ---
  useEffect(() => {
    // Check if running in the browser before accessing localStorage
    if (typeof window === 'undefined') {
      setLoading(false); // Not in browser, stop loading
      return;
    }

    const checkSession = async () => {
        setLoading(true);
        let storedToken: string | null = null;
        try {
            storedToken = localStorage.getItem('authToken');
        } catch (error) {
            console.warn("AuthProvider: Error accessing localStorage (maybe disabled).", error);
        }

        if (storedToken) {
            setSessionToken(storedToken); // Set token state first
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                if (response.ok) {
                    const userData: SimpleUser = await response.json();
                    setUser(userData);
                    console.log("AuthProvider: Session restored for user:", userData.email);
                } else {
                     console.warn("AuthProvider: Invalid or expired token found. Clearing session.");
                    localStorage.removeItem('authToken');
                    setUser(null);
                    setSessionToken(null);
                }
            } catch (error) {
                console.error("AuthProvider: Error during session check API call:", error);
                localStorage.removeItem('authToken');
                setUser(null);
                setSessionToken(null);
            }
        } else {
             // No token found
             // console.log("AuthProvider: No session token found.");
             setUser(null);
             setSessionToken(null);
        }
        setLoading(false);
    };

    checkSession();
    // This effect should only run once on mount
  }, []);


  // Simplified error handling for API simulation
  const handleAuthError = (error: any, action: "Sign-In" | "Sign-Up" | "Sign-Out" | "Session Check") => {
    let errorMessage = `An error occurred during ${action}. Please try again.`;
    let title = `${action} Failed`;

    if (error instanceof Error) {
        // Use message from simulated API error if available
        errorMessage = error.message || errorMessage;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    // Log the full error for debugging
    console.error(`${action} Error:`, error?.code, errorMessage, error);

    toast({
        title: title,
        description: errorMessage,
        variant: "destructive",
    });
  };


  const signInWithEmailPassword = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }

        const { token, user: userData } = await response.json();

        setUser(userData);
        setSessionToken(token);
         if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
         }
        toast({ title: "Successfully signed in." });
        setLoading(false);
        return true;

    } catch (error: any) {
        handleAuthError(error, "Sign-In");
        setUser(null);
        setSessionToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setLoading(false);
        return false;
    }
  }, [toast]); // Added toast dependency

 const signUpWithEmailPassword = useCallback(async (name: string, email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: pass }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Sign-up failed with status ${response.status}`);
        }

        const { token, user: newUser } = await response.json();

        setUser(newUser);
        setSessionToken(token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
        toast({ title: "Account created successfully!" });
        setLoading(false);
         return true;

    } catch (error: any) {
        handleAuthError(error, "Sign-Up");
        setUser(null);
        setSessionToken(null);
        if (typeof window !== 'undefined') {
             localStorage.removeItem('authToken');
        }
        setLoading(false);
        return false;
    }
 }, [toast]); // Added toast dependency


  const signOut = useCallback(async () => {
    setLoading(true);
    try {
        // Simulate API call to logout endpoint (optional)
        // await fetch('/api/auth/logout', { method: 'POST' });

        setUser(null);
        setSessionToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        toast({ title: "Successfully signed out." });
        setDemoRole('student'); // Reset demo role on sign out
    } catch (error: any) {
      handleAuthError(error, "Sign-Out");
    } finally {
        setLoading(false);
    }
  }, [toast]); // Added toast dependency

  // Function to set the demo role, only works if user is not logged in
  const handleSetRole = useCallback((role: UserRole) => {
    if (!user) {
      setDemoRole(role);
    } else {
      console.warn("Cannot set demo role while logged in.");
      // Optionally provide feedback to the user
      // toast({ title: "Action Denied", description: "Log out to switch demo roles." });
    }
  }, [user]);


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
      signInWithEmailPassword, // Add memoized functions
      signUpWithEmailPassword,
      signOut
    ]);


  // Render children; loading state handles initial rendering until session check completes.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
