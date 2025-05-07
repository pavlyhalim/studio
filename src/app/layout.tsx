import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import AuthRedirector from '@/components/AuthRedirector';
import NetworkStatus from '@/components/NetworkStatus';

export const metadata: Metadata = {
  title: 'ALANT Lite',
  description: 'AI-Powered Learning App by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          {/* Show offline banner when needed */}
          <NetworkStatus />
          {/* Redirect user on login/logout */}
          <AuthRedirector />
          {/* Main application */}
          {children}
          {/* Global toasts */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}