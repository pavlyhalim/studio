
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import for GeistSans
// Removed GeistMono import as it was causing module not found error
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

export const metadata: Metadata = {
  title: 'ALANT Lite', // Updated title
  description: 'AI-Powered Learning App by Firebase Studio', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed GeistMono variable usage
    <html lang="en" className={`${GeistSans.variable}`}>
      {/* Apply font variables directly to the html tag */}
      {/* Added suppressHydrationWarning to ignore potential mismatches caused by browser extensions */}
      <body className={`antialiased font-sans`} suppressHydrationWarning={true}> {/* Use Tailwind's font-sans class */}
        <AuthProvider>
            {children}
            <Toaster /> {/* Add Toaster component here */}
        </AuthProvider>
      </body>
    </html>
  );
}
