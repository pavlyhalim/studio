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
    // Use updated useAuth hook
    const { user, loading, signInWithEmailPassword } = useAuth();
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

    // Removed handleGoogleSignIn

    const handleEmailPasswordSignIn = async (e: FormEvent) => {
         e.preventDefault();
        // Removed isFirebaseReady check
        if (!email || !password) {
            // Basic validation, AuthContext will handle more specific errors via simulated API call
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
                <CardContent className="space-y-6">
                    {/* Removed Firebase not ready alert */}

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
                                disabled={isSubmitting} // Removed isFirebaseReady check
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
                                disabled={isSubmitting} // Removed isFirebaseReady check
                                className="pl-10" // Add padding for icon
                                autoComplete="current-password"
                             />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90" // Use primary color for main login action
                            disabled={isSubmitting} // Removed isFirebaseReady check
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Sign In
                        </Button>
                    </form>

                    {/* Removed Google Sign-In and Separator */}

                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-3 pt-6 border-t">
                     <Button variant="link" className="text-sm text-muted-foreground h-auto p-0" disabled>
                         Forgot password? (Coming Soon)
                     </Button>
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
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
