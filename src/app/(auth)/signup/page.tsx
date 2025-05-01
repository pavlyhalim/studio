
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function SignUpPage() {
    const { user, loading, signUpWithEmailPassword } = useAuth();
    const router = useRouter();
    const { toast } = useToast(); // Get toast function
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSignUp = async (e: FormEvent) => {
         e.preventDefault();
         setPasswordError(null);

        if (!name || !email || !password || !confirmPassword) {
             toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
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
         // signUpWithEmailPassword now returns true on success, false on failure
         const success = await signUpWithEmailPassword(name, email, password);

         if (!success) {
             // Error is already handled (logged and toasted) within AuthContext
             console.log("SignUp page: Email/Password Sign-Up Failed (handled by context)");
         }
         // Redirect is handled by the useEffect hook upon successful signup state update

         // Always set submitting false after attempt
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
                            Checking status...
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
        return null; // Don't render sign-up form if user is logged in
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
                                disabled={isSubmitting}
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
                                placeholder="Password (min. 6 characters)"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                                className={`pl-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                autoComplete="new-password"
                             />
                         </div>
                         {passwordError && (
                            <p className="text-sm text-destructive">{passwordError}</p>
                         )}
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Sign Up
                        </Button>
                    </form>

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
