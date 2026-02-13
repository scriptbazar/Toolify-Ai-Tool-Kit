
'use client';

import * as React from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/common/Logo';
import { ModeToggle } from '@/components/common/ModeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';
import { Bell, Home, LogOut, User, Settings, Menu, Star, ShieldCheck, UserCog, Loader2 } from 'lucide-react';
import { AuthContextProvider } from '@/context/AuthContext';


// The actual client-side layout component
function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, userData, loading, isAdmin } = useAuth();
  
  const isLoginPage = pathname === '/admin/login';

  // Fallback redirection logic
  React.useEffect(() => {
    if (!loading && !isLoginPage) {
        if (!user) {
            router.replace('/admin/login');
        } else if (!isAdmin) {
            // User is logged in but is NOT an admin.
            // Show error and kick them to the main dashboard.
            toast({
                title: "Access Restricted",
                description: "You do not have permission to view the admin panel.",
                variant: "destructive"
            });
            router.replace('/dashboard');
        }
    }
  }, [user, loading, isLoginPage, isAdmin, router, toast]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Make a call to our backend to clear the session cookie
      await fetch('/api/auth/session-logout', { method: 'POST' });
      toast({
        title: "Logged Out",
        description: "Admin session cleared successfully.",
      });
      // Redirect to the admin login page after logout
      router.push('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // Only render the layout if user is logged in AND is an admin
  if (loading || !user || !isAdmin) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
          <Logo className="h-16 w-16 animate-pulse" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-lg">Verifying Admin Access...</p>
          </div>
        </div>
    );
  }

  const mobileNavContent = (
    <>
      <SheetHeader className="text-left border-b p-4">
         <SheetTitle>
           <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo />
            <span className="text-lg">ToolifyAI</span>
          </Link>
        </SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1">
        <AdminSidebarNav />
      </ScrollArea>
      <div className="mt-auto p-4 border-t">
        <div className="grid grid-cols-2 gap-2">
            <Button asChild className="w-full justify-center" variant="outline">
              <Link href="/admin/profile">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full justify-center">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
      </div>
    </>
  );

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
                <span className="text-lg">ToolifyAI</span>
              </Link>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <AdminSidebarNav />
            </ScrollArea>
             <div className="mt-auto p-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                    <Button asChild className="w-full justify-center" variant="outline">
                        <Link href="/admin/profile">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="w-full justify-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                </div>
              </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50">
             <div className="flex-1 md:hidden pt-1.5">
               <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Logo />
                  <span className="text-lg">ToolifyAI</span>
               </Link>
             </div>
            <div className="w-full flex-1 hidden md:block">&nbsp;</div>
            <div className="flex-1 flex justify-end items-center gap-2 md:hidden">
               <ModeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Admin Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-0 w-[280px] sm:w-[320px]">
                   <SheetHeader>
                      <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                   </SheetHeader>
                   {mobileNavContent}
                </SheetContent>
              </Sheet>
            </div>
             <div className="hidden md:flex items-center gap-4">
               <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary/10 text-primary font-bold">{userData?.firstName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData ? `${userData.firstName} ${userData.lastName}` : 'Admin'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData?.email || 'admin@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => router.push(`/admin/profile`)}>
                    <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                    <span>Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/admin/users/${user?.uid}`)}>
                    <UserCog className="mr-2 h-4 w-4 text-sky-500" />
                    <span>Edit Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                     <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthContextProvider>
  );
}
