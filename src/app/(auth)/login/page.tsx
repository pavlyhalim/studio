
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, LogIn, UserPlus, Mail, Lock } from "lucide-react"; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function LoginPage() {
    const { user, loading, signInWithEmailPassword } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast(); // Get toast function
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            // Redirect to intended destination or dashboard
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
         setIsSubmitting(true);
         // signInWithEmailPassword now returns true on success, false on failure
         const success = await signInWithEmailPassword(email, password);

         if (!success) {
             // Error is already handled (logged and toasted) within AuthContext
             console.log("Login page: Email/Password Sign-In Failed (handled by context)");
         }
         // Redirect is handled by the useEffect hook upon successful login state update

         // Always set submitting false after attempt, regardless of success/failure
         setIsSubmitting(false);
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-secondary/30 to-background p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <LogIn className="h-7 w-7" /> Welcome Back!
                    </CardTitle>
                    <CardDescription>Sign in to access your ALANT Lite dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

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
