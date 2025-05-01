
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, LayoutDashboard, GraduationCap } from 'lucide-react'; // Added GraduationCap
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
    <nav className="bg-background/95 shadow-md sticky top-0 z-50 backdrop-blur-sm"> {/* Added backdrop blur */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
          <GraduationCap className="h-7 w-7 text-accent" /> {/* Added icon */}
          ALANT Lite
        </Link>
        <div className="flex items-center space-x-4">
          {/* Always show Dashboard link */}
           <Link href="/dashboard" legacyBehavior passHref>
                <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-primary hover:bg-accent/10"> {/* Improved hover */}
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Button>
           </Link>

          {loading ? (
             <div className="flex items-center space-x-4">
                <Skeleton className="h-9 w-20 rounded-md" /> {/* Adjusted size */}
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"> {/* Added focus ring */}
                   <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/50 transition-colors"> {/* Adjusted border */}
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 shadow-xl" align="end" forceMount> {/* Wider dropdown, more shadow */}
                <DropdownMenuLabel className="font-normal py-2"> {/* Adjusted padding */}
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/10"> {/* Added hover style */}
                   {/* Link to actual dashboard */}
                   <Link href="/dashboard">
                     <LayoutDashboard className="mr-2 h-4 w-4" />
                     <span>Dashboard</span>
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem disabled className="cursor-not-allowed hover:bg-accent/10"> {/* Placeholder for future profile page */}
                   <User className="mr-2 h-4 w-4" />
                   <span>Profile</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem disabled className="cursor-not-allowed hover:bg-accent/10"> {/* Placeholder for future settings page */}
                   <Settings className="mr-2 h-4 w-4" />
                   <span>Settings</span>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive"> {/* Destructive styling */}
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <>
              {/* Link Login button to the login page */}
              <Link href="/login" passHref legacyBehavior>
                <Button variant="outline" className="hover:bg-accent/10">Log In</Button>
              </Link>
               {/* Placeholder Sign Up button - replace with actual sign-up flow later */}
              <Button variant="default" className="bg-accent hover:bg-accent/90" disabled>Sign Up</Button> {/* Using accent for sign up */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
