
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";


export function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <nav className="bg-background shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          ALANT Lite
        </Link>
        <div className="flex items-center space-x-4">
          {loading ? (
             <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                   {/* TODO: Link to actual dashboard based on role */}
                   <Link href="/dashboard">
                     <LayoutDashboard className="mr-2 h-4 w-4" />
                     <span>Dashboard</span>
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem disabled> {/* Placeholder for future profile page */}
                   <User className="mr-2 h-4 w-4" />
                   <span>Profile</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem disabled> {/* Placeholder for future settings page */}
                   <Settings className="mr-2 h-4 w-4" />
                   <span>Settings</span>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <>
              <Button variant="outline" onClick={signInWithGoogle}>Log In</Button>
               {/* Placeholder Sign Up button - replace with actual sign-up flow later */}
              <Button variant="default" disabled>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
