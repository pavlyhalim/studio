
import type { ReactNode } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

// TODO: Implement proper role-based access control using middleware or layout logic
// This layout assumes the user is authenticated (handled by middleware or page checks)

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar /> {/* Keep the main navbar */}
        <main className="flex-grow container mx-auto px-4 py-8">
            {children} {/* Page content will be rendered here */}
        </main>
        <Footer /> {/* Keep the main footer */}
    </div>
  );
}
