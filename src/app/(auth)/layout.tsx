import type { ReactNode } from 'react';

// Layout for authentication pages (login, signup)
// Provides a minimal structure without the main navbar/footer
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 to-background flex items-center justify-center p-4">
      {/* Content will be the login or signup page */}
      {children}
    </div>
  );
}
