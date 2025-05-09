"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { 
  Loader2, AlertTriangle, LogIn, 
  UserPlus, Mail, Lock, Github, 
  Chrome 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/error-boundary';

export default function LoginPage() {
    const { user, loading, signInWithEmailPassword, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
          // Redirect is now handled by auth context
          // This code will likely not run, but keeping it as a backup
          const redirectUrl = searchParams.get('redirect') || '/dashboard';
          router.push(redirectUrl);
        }
      }, [user, loading, router, searchParams]);

    const handleEmailPasswordSignIn = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Missing Fields", description: "Email and password are required.", variant: "destructive" });
            return;
        }
        
        setError(null);
        setIsSubmitting(true);
        
        try {
            // Use Firebase authentication
            const success = await signInWithEmailPassword(email, password);
            
            if (!success) {
                // Error is already handled (logged and toasted) within AuthContext
                console.log("Login page: Email/Password Sign-In Failed (handled by context)");
            }
            // Redirect is handled by the useEffect hook upon successful login state update
        } catch (err) {
            // This should not happen since errors are handled in the context
            setError("An unexpected error occurred. Please try again.");
        } finally {
            // Always set submitting false after attempt, regardless of success/failure
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
            // Redirect handled by useEffect
        } catch (err) {
            // This should not happen since errors are handled in the context
            setError("Failed to sign in with Google. Please try again.");
        }
    };

    if (loading) { // Only show loader based on auth loading state
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Loading
                        </CardTitle>
                        <CardDescription>
                            Checking your login status...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user) {
        return null; // Don't render login form if user is logged in (before redirect)
    }

    return (
        <ErrorBoundary>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                            <LogIn className="h-7 w-7" /> Welcome Back!
                        </CardTitle>
                        <CardDescription>Sign in to access your ALANT Lite dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

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
                                    disabled={isSubmitting}
                                    className="pl-10"
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
                                    disabled={isSubmitting}
                                    className="pl-10"
                                    autoComplete="current-password"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                Sign In
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                <Chrome className="mr-2 h-4 w-4" />
                                Sign in with Google
                            </Button>
                        </div>
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
        </ErrorBoundary>
    );
}