
"use client";

import { useContext } from 'react';
import { AuthContext, type UserRole } from '@/context/auth-context'; // Import UserRole type

// Custom hook to access AuthContext values
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Ensure the hook is used within a provider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Explicitly return all fields from the context for clarity and type safety
  return {
    user: context.user, // Contains basic user info { id, email, name, role } or null
    userId: context.userId, // User's ID or null
    loading: context.loading,
    signInWithEmailPassword: context.signInWithEmailPassword, // Returns boolean
    signUpWithEmailPassword: context.signUpWithEmailPassword, // Returns boolean
    signOut: context.signOut,
    role: context.role, // Effective role (user's role or demo role if logged out)
    setRole: context.setRole, // Function to set the demo role (only works if logged out)
  };
};
