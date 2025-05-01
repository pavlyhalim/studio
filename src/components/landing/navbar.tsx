"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, LayoutDashboard, GraduationCap, AlertTriangle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export function Navbar() {
  // Use updated hook, remove userData and isFirebaseReady
  const { user, loading, signOut } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
     <TooltipProvider>
        <nav className="bg-background/95 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-border/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
            <GraduationCap className="h-7 w-7 text-accent" />
            ALANT Lite
            </Link>
            <div className="flex items-center space-x-4">
            {/* Always show Dashboard link */}
            <Link href="/dashboard" legacyBehavior passHref>
                    <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-primary hover:bg-accent/10">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
            </Link>

            {loading ? (
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            ) : user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                        {/* Use user.name, fallback to 'User' */}
                        {/* Removed photoURL */}
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 shadow-xl border border-border/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal py-2">
                    <div className="flex flex-col space-y-1">
                        {/* Use user.name */}
                        <p className="text-sm font-medium leading-none text-foreground">{user?.name ?? 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/10">
                    <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="cursor-not-allowed opacity-50 hover:bg-accent/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="cursor-not-allowed opacity-50 hover:bg-accent/10">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    {/* Removed Firebase readiness check and tooltip */}
                    <Link href="/login" passHref legacyBehavior>
                        <Button variant="outline" className="hover:bg-accent/10 border-primary/30 hover:border-accent transition-colors">Log In</Button>
                    </Link>
                    <Link href="/signup" passHref legacyBehavior>
                        <Button variant="default" className="bg-accent hover:bg-accent/90">Sign Up</Button>
                    </Link>
                </>
            )}
            </div>
        </div>
        </nav>
    </TooltipProvider>
  );
}
