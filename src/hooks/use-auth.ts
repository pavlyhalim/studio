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
    // userData is removed, info is in user object now
    sampleUserId: context.sampleUserId, // Keep for demo mode
    loading: context.loading,
    // signInWithGoogle is removed
    signInWithEmailPassword: context.signInWithEmailPassword,
    signUpWithEmailPassword: context.signUpWithEmailPassword,
    signOut: context.signOut,
    role: context.role,
    setRole: context.setRole,
    // isFirebaseReady is removed
  };
};
