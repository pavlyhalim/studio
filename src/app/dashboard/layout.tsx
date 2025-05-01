
import type { ReactNode } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, User, Settings } from 'lucide-react';

// TODO: Implement proper role-based access control using middleware or layout logic
// This layout assumes the user is authenticated (handled by middleware or page checks)

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
        <Sidebar>
             <SidebarHeader className="border-b border-sidebar-border">
                 {/* Can add Logo or Title here */}
             </SidebarHeader>
             <SidebarContent className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                         <Link href="/dashboard" legacyBehavior passHref>
                            <SidebarMenuButton>
                                <LayoutDashboard />
                                Dashboard Home
                            </SidebarMenuButton>
                         </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                         <Link href="/dashboard/profile" legacyBehavior passHref>
                             <SidebarMenuButton>
                                <User />
                                Profile
                             </SidebarMenuButton>
                         </Link>
                     </SidebarMenuItem>
                     <SidebarMenuItem>
                         <Link href="/dashboard/settings" legacyBehavior passHref>
                             <SidebarMenuButton>
                                <Settings />
                                Settings
                             </SidebarMenuButton>
                         </Link>
                     </SidebarMenuItem>
                     {/* Add more sidebar links based on roles */}
                </SidebarMenu>
             </SidebarContent>
             <SidebarFooter className="border-t border-sidebar-border p-2">
                {/* Can add user info or logout button here */}
             </SidebarFooter>
        </Sidebar>

        <SidebarInset>
            <Navbar /> {/* Keep the main navbar */}
             <main className="flex-grow container mx-auto px-4 py-8">
                 <div className="mb-4 md:hidden"> {/* Show trigger only on mobile */}
                     <SidebarTrigger />
                 </div>
                {children} {/* Page content will be rendered here */}
             </main>
            <Footer /> {/* Keep the main footer */}
        </SidebarInset>

    </SidebarProvider>
  );
}
