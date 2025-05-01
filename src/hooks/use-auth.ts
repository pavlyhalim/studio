
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
    user: context.user, // Now contains basic user info { id, email, name, role }
    // sampleUserId is removed
    loading: context.loading,
    signInWithEmailPassword: context.signInWithEmailPassword, // Returns boolean
    signUpWithEmailPassword: context.signUpWithEmailPassword, // Returns boolean
    signOut: context.signOut,
    role: context.role,
    // setRole is removed
  };
};
