
"use client";

import { useContext } from 'react';
import { AuthContext, type UserRole } from '@/context/auth-context'; // Import UserRole type

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Explicitly return the context fields including role, setRole, and userId
  return {
    user: context.user,
    userId: context.userId, // Add userId
    loading: context.loading,
    signInWithGoogle: context.signInWithGoogle,
    signOut: context.signOut,
    role: context.role,
    setRole: context.setRole,
  };
};
