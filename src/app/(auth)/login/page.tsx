"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, LogIn, UserPlus, Mail, Lock } from "lucide-react"; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
    const { user, loading, signInWithGoogle, signInWithEmailPassword, isFirebaseReady } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state

    useEffect(() => {
        // Redirect to dashboard if user is already logged in and not loading
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        if (!isFirebaseReady) {
             console.error("Login page: Attempted Google sign-in while Firebase is not ready.");
            return;
        }
        setIsSubmitting(true); // Set submitting state for Google sign-in
        try {
            await signInWithGoogle();
            // Redirect is handled by the useEffect hook
        } catch (error) {
            // Error handling is done within the AuthContext
            console.error("Login page: Google Sign-In Error:", error);
        } finally {
             setIsSubmitting(false); // Reset submitting state
        }
    };

    const handleEmailPasswordSignIn = async (e: FormEvent) => {
         e.preventDefault();
        if (!isFirebaseReady) {
             console.error("Login page: Attempted Email/Pass sign-in while Firebase is not ready.");
            return;
        }
        if (!email || !password) {
            // Basic validation, AuthContext will handle more specific errors
            return;
        }
         setIsSubmitting(true); // Set submitting state
         try {
             await signInWithEmailPassword(email, password);
              // Redirect is handled by the useEffect hook
         } catch (error) {
             // Error handling is done within the AuthContext
            console.error("Login page: Email/Password Sign-In Error:", error);
         } finally {
            setIsSubmitting(false); // Reset submitting state
         }
    };


    // Show loading state while checking auth status or during sign-in/submit
    if (loading || isSubmitting) { // Combine loading checks
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background">
                 <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-primary">
                           {isSubmitting ? 'Signing In...' : 'Loading'}
                        </CardTitle>
                        <CardDescription>
                            {isSubmitting ? 'Please wait...' : 'Checking your login status...'}
                        </CardDescription>
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
        return null;
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <LogIn className="h-7 w-7" /> Welcome Back!
                    </CardTitle>
                    <CardDescription>Sign in to access your ALANT Lite dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6"> {/* Increased spacing */}
                     {!isFirebaseReady && (
                         <Alert variant="destructive">
                             <AlertTriangle className="h-4 w-4" />
                             <AlertTitle>Configuration Error</AlertTitle>
                             <AlertDescription>
                                 Firebase is not configured correctly. Sign-in is unavailable. Please contact support or check the console for details.
                             </AlertDescription>
                         </Alert>
                     )}

                    {/* Email/Password Form */}
                     <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting || !isFirebaseReady}
                                className="pl-10" // Add padding for icon
                                autoComplete="email"
                             />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting || !isFirebaseReady}
                                className="pl-10" // Add padding for icon
                                autoComplete="current-password"
                             />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90" // Use primary color for main login action
                            disabled={isSubmitting || !isFirebaseReady}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Sign In
                        </Button>
                    </form>

                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>


                    {/* Google Sign-In Button */}
                    <Button
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="w-full transition-colors duration-200 ease-in-out group"
                        disabled={isSubmitting || !isFirebaseReady}
                    >
                        <svg className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                        Sign in with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-3 pt-6 border-t">
                     {/* Placeholder for Forgot Password */}
                     <Button variant="link" className="text-sm text-muted-foreground h-auto p-0" disabled>
                         Forgot password? (Coming Soon)
                     </Button>
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        {/* Link to Sign Up page */}
                        <Link href="/signup" className="font-medium text-accent hover:underline">
                           Sign Up
                        </Link>
                    </p>
                     <Link href="/" className="text-sm text-muted-foreground hover:text-primary mt-4">
                        &larr; Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
