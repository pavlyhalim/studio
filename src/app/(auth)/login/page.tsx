
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle } from "lucide-react"; // Import loader icon and AlertTriangle
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

export default function LoginPage() {
    const { user, loading, signInWithGoogle, isFirebaseReady } = useAuth(); // Add isFirebaseReady
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if user is already logged in and not loading
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        // Prevent sign-in if Firebase isn't ready
        if (!isFirebaseReady) {
             console.error("Login page: Attempted sign-in while Firebase is not ready.");
             // Optionally show a toast or keep the button disabled
            return;
        }
        try {
            await signInWithGoogle();
            // Redirect is handled by the useEffect hook
        } catch (error) {
            // Error handling is done within the AuthContext
            console.error("Login page: Google Sign-In Error:", error);
        }
    };


    // Show loading state while checking auth status or during sign-in
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background">
                 <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-primary">Loading</CardTitle>
                        <CardDescription>Checking your login status...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center py-10">
                         <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                 </Card>
            </div>
        );
    }

     // Don't render login form if user is logged in (before redirect happens)
    if (user) {
        return null; // Or a minimal loading indicator until redirect completes
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
                    <CardDescription>Sign in to access your ALANT Lite dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {!isFirebaseReady && ( // Show alert if Firebase config is invalid/missing
                         <Alert variant="destructive">
                             <AlertTriangle className="h-4 w-4" />
                             <AlertTitle>Configuration Error</AlertTitle>
                             <AlertDescription>
                                 Firebase is not configured correctly. Sign-in is unavailable. Please contact support or check the console for details.
                             </AlertDescription>
                         </Alert>
                     )}

                    {/* Add email/password form here if needed in the future */}
                    {/* <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div> */}
                    <Button
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="w-full transition-colors duration-200 ease-in-out group"
                        disabled={loading || !isFirebaseReady} // Disable button while loading or if Firebase isn't ready
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                          // Add Google Icon SVG
                          <svg className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                         )}
                        Sign in with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2 pt-6 border-t">
                     {/* Placeholder for Forgot Password */}
                    {/* <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                        Forgot password?
                    </Link> */}
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        {/* Placeholder Sign Up link */}
                        <Button variant="link" className="h-auto p-0 font-medium text-accent hover:underline" disabled>
                            Sign up (Coming Soon)
                        </Button>
                    </p>
                     <Link href="/" className="text-sm text-muted-foreground hover:text-primary mt-4">
                        &larr; Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
