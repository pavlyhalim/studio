"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, UserPlus, Mail, Lock, User as UserIcon } from "lucide-react"; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator"; // Import Separator

export default function SignUpPage() {
    const { user, loading, signUpWithEmailPassword, isFirebaseReady } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect to dashboard if user is already logged in and not loading
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSignUp = async (e: FormEvent) => {
         e.preventDefault();
         setPasswordError(null); // Reset password error

        if (!isFirebaseReady) {
             console.error("SignUp page: Attempted sign-up while Firebase is not ready.");
            return;
        }
        if (!name || !email || !password || !confirmPassword) {
            // Basic validation
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
             setPasswordError("Password must be at least 6 characters long.");
             return;
        }

         setIsSubmitting(true);
         try {
             await signUpWithEmailPassword(name, email, password);
              // Redirect is handled by the useEffect hook after state change
         } catch (error) {
             // Error handling is done within the AuthContext
            console.error("SignUp page: Email/Password Sign-Up Error:", error);
         } finally {
            setIsSubmitting(false);
         }
    };

    // Show loading state
    if (loading || isSubmitting) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background">
                 <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-primary">
                           {isSubmitting ? 'Creating Account...' : 'Loading'}
                        </CardTitle>
                        <CardDescription>
                            {isSubmitting ? 'Please wait...' : 'Checking status...'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center py-10">
                         <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                 </Card>
            </div>
        );
    }

     // Don't render sign-up form if user is logged in
    if (user) {
        return null;
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <UserPlus className="h-7 w-7" /> Create Account
                    </CardTitle>
                    <CardDescription>Join ALANT Lite by creating an account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     {!isFirebaseReady && (
                         <Alert variant="destructive">
                             <AlertTriangle className="h-4 w-4" />
                             <AlertTitle>Configuration Error</AlertTitle>
                             <AlertDescription>
                                 Firebase is not configured correctly. Sign-up is unavailable. Please contact support or check the console for details.
                             </AlertDescription>
                         </Alert>
                     )}

                    {/* Sign-up Form */}
                     <form onSubmit={handleSignUp} className="space-y-4">
                         <div className="relative">
                           <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                                id="name"
                                type="text"
                                placeholder="Full Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting || !isFirebaseReady}
                                className="pl-10"
                                autoComplete="name"
                            />
                        </div>
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
                                className="pl-10"
                                autoComplete="email"
                             />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting || !isFirebaseReady}
                                className="pl-10"
                                autoComplete="new-password"
                             />
                        </div>
                         <div className="relative">
                             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm Password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting || !isFirebaseReady}
                                className={`pl-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                autoComplete="new-password"
                             />
                         </div>
                         {passwordError && (
                            <p className="text-sm text-destructive">{passwordError}</p>
                         )}
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90" // Use accent color for sign up
                            disabled={isSubmitting || !isFirebaseReady}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Sign Up
                        </Button>
                    </form>

                      {/* Separator and Google Sign-in (Optional on Sign Up Page) */}
                     {/*
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or sign up with
                            </span>
                        </div>
                    </div>
                     <Button
                        // onClick={handleGoogleSignIn} // You might want a separate handler or redirect
                        variant="outline"
                        className="w-full transition-colors duration-200 ease-in-out group"
                        disabled={isSubmitting || !isFirebaseReady}
                    >
                         <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                        Sign up with Google
                    </Button>
                     */}

                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-3 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-accent hover:underline">
                           Sign In
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
