
"use client";

import { useState, type FormEvent, useEffect } from "react"; // Import useEffect
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Trash2, Save, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  // State for forms
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || ''); // Email is usually not changeable
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Loading states for different actions
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Update name/email on component mount/user change
   useEffect(() => {
     if (user) {
       setName(user.name || '');
       setEmail(user.email || '');
     }
   }, [user]);


  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/settings');
    }
  }, [user, loading, router]);


  // --- Handlers (Simulated API calls - Replace with actual calls) ---

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || name === user?.name) {
        toast({title: "No Changes", description: "Name is the same or empty."});
        return;
    }
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
        // *** TODO: Replace with actual API Call ***
        console.log("Simulating API call to update profile with name:", name);
        await new Promise(res => setTimeout(res, 1000));
        // Example API call:
        // const response = await fetch('/api/user/profile', {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` }, // Assume sessionToken is available
        //     body: JSON.stringify({ name }),
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Failed to update profile.');
        // }
        // const updatedUser = await response.json();
        // updateUserContext(updatedUser); // Update context

        toast({ title: "Profile Updated", description: "Your name has been updated (simulated)." });
    } catch (error: any) {
        const message = error.message || "Failed to update profile.";
        setProfileError(message);
        toast({ title: "Update Failed", description: message, variant: "destructive" });
    } finally {
        setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        setPasswordError("Please fill all password fields.");
        return;
    }
    if (newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters long.");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        setPasswordError("New passwords do not match.");
        return;
    }
    if (currentPassword === newPassword) {
        setPasswordError("New password cannot be the same as the current one.");
        return;
    }

    setIsChangingPassword(true);
    try {
      // *** TODO: Replace with actual API Call ***
        console.log("Simulating API call to change password...");
        // Example API call:
        // const response = await fetch('/api/user/password', {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` }, // Assume sessionToken is available
        //     body: JSON.stringify({ currentPassword, newPassword }),
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Failed to change password.');
        // }
        await new Promise((resolve, reject) => setTimeout(() => {
             // Simulate success/failure based on a mock check (replace with API result)
            if (currentPassword === "wrongpassword") { // Simulate incorrect current password
                reject(new Error("Incorrect current password."));
            } else {
                resolve(true);
            }
        }, 1500));


      toast({ title: "Password Changed", description: "Your password has been updated successfully (simulated)." });
      // Clear password fields after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
        const message = error.message || "Failed to change password.";
        setPasswordError(message);
        toast({ title: "Password Change Failed", description: message, variant: "destructive" });
    } finally {
        setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
        // *** TODO: Replace with actual API Call ***
        console.log("Simulating API call for account deletion...");
        // Example API call:
        // const response = await fetch('/api/user/account', {
        //     method: 'DELETE',
        //     headers: { 'Authorization': `Bearer ${sessionToken}` }, // Assume sessionToken is available
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Could not delete account.');
        // }
        await new Promise(res => setTimeout(res, 2000));

        toast({ title: "Account Deleted", description: "Your account has been permanently deleted (simulated)." });
        await signOut(); // Sign out the user after deletion
        // Redirect handled by AuthProvider or router push
        router.push('/'); // Explicit redirect after sign out
    } catch (error: any) {
        toast({ title: "Deletion Failed", description: error.message || "Could not delete account.", variant: "destructive" });
        setIsDeletingAccount(false);
    }
    // No finally needed if navigating away
  };

  if (loading || !user) { // Show loading or nothing until redirect happens
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // User is authenticated and loaded
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-primary">Account Settings</h1>

      {/* Update Profile Section */}
      <Card className="shadow-md border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Profile Information</CardTitle>
          <CardDescription>Update your name and view your email address.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            {profileError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Update Error</AlertTitle>
                    <AlertDescription>{profileError}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="settings-name">Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdatingProfile}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email Address</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                readOnly
                disabled
                className="bg-secondary/20 cursor-not-allowed border-none"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={isUpdatingProfile || name === user.name} className="bg-accent hover:bg-accent/90">
              {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      {/* Change Password Section */}
      <Card className="shadow-md border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/> Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            {passwordError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Password Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isChangingPassword}
                required
                autoComplete="new-password"
                className={newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
               {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
               )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={isChangingPassword} className="bg-accent hover:bg-accent/90">
              {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Card>

       <Separator />

        {/* Delete Account Section */}
      <Card className="border-destructive/50 shadow-md">
         <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5"/> Danger Zone</CardTitle>
          <CardDescription>Manage potentially harmful account actions.</CardDescription>
        </CardHeader>
        <CardContent>
             <AlertDialog>
                 <AlertDialogTrigger asChild>
                     <Button variant="destructive" disabled={isDeletingAccount}>
                         {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                         Delete Account
                     </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                 <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all associated data from ALANT Lite.
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     >
                         {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         {isDeletingAccount ? 'Deleting...' : 'Yes, Delete Account'}
                     </AlertDialogAction>
                 </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
             <p className="text-sm text-muted-foreground mt-2">Permanently delete your account and all data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
