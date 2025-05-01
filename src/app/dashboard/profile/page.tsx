"use client";

import { useEffect } from 'react'; // Import useEffect
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Shield, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter(); // Initialize router

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/profile');
    }
  }, [user, loading, router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
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
    <Card className="max-w-2xl mx-auto shadow-lg border-border/30">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-md">
            {/* Placeholder for potential image upload later */}
            {/* <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User Avatar'} /> */}
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">{user.name || "User Profile"}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-4 w-4" /> Role: <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'professor' ? 'secondary' : 'default'}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center text-muted-foreground"><User className="mr-2 h-4 w-4" />Name</Label>
          <Input id="name" value={user.name || ''} readOnly disabled className="bg-secondary/10 border-none"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4" />Email Address</Label>
          <Input id="email" type="email" value={user.email || ''} readOnly disabled className="bg-secondary/10 border-none"/>
        </div>
        {/* Add more profile fields here if needed */}
      </CardContent>
      <CardFooter className="border-t p-6 flex justify-end bg-secondary/10 rounded-b-lg">
        <Link href="/dashboard/settings" passHref legacyBehavior>
          <Button variant="default" className="bg-accent hover:bg-accent/90">
            <Settings className="mr-2 h-4 w-4" /> Go to Settings
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
