'use client';

import * as React from 'react';
import {
  Home,
  Star,
  Ticket,
  LogOut,
  User,
  Settings,
  History,
  CreditCard,
  Menu,
  Users as UsersIcon,
  FileText,
  Bell,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/common/Logo';
import { ModeToggle } from '@/components/common/ModeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as FirebaseUser } from 'firebase/auth';
import type { DocumentData } from 'firebase-admin/firestore';


const allNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'text-sky-500' },
    { href: '/my-favorites', label: 'My Favorites', icon: Star, color: 'text-yellow-500' },
    { href: '/community-chat', label: 'Community Chat', icon: MessageSquare, color: 'text-blue-500' },
    { href: '/my-media', label: 'My Media', icon: FileText, color: 'text-orange-500' },
    { href: '/usage-history', label: 'Usage History', icon: History, color: 'text-indigo-500' },
    { href: '/my-tickets', label: 'My Tickets', icon: Ticket, color: 'text-rose-500' },
    { href: '/manage-subscription', label: 'Manage Subscription', icon: CreditCard, color: 'text-lime-500' },
    { href: '/payment-history', label: 'Payment History', icon: CreditCard, color: 'text-green-500' },
    { href: '/affiliate-program', label: 'Affiliate Program', icon: UsersIcon, color: 'text-teal-500' },
    { href: '/settings', label: 'Profile Settings', icon: Settings, color: 'text-slate-500' },
    { href: '/login-history', label: 'Login History', icon: History, color: 'text-cyan-500' },
];


export function DashboardLayoutClient({
  children,
  user,
  userData
}: {
  children: React.ReactNode;
  user: FirebaseUser;
  userData: DocumentData | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Make a call to our backend to clear the session cookie
      await fetch('/api/auth/session-logout', { method: 'POST' });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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
        <nav className="grid gap-2 text-base font-medium p-4">
            {allNavLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                        pathname === link.href && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    )}
                    >
                    <link.icon className={cn('h-4 w-4', pathname !== link.href && link.color)} />
                    {link.label}
                </Link>
            ))}
        </nav>
      </ScrollArea>
       <div className="mt-auto p-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild className="w-full justify-center">
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
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

  const sidebarNav = (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">ToolifyAI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4 py-4">
            {allNavLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                        pathname === link.href && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    )}
                    >
                    <link.icon className={cn('h-4 w-4', pathname !== link.href && link.color)} />
                    {link.label}
                </Link>
            ))}
        </nav>
      </ScrollArea>
       <div className="mt-auto p-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild className="w-full justify-center">
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
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
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        {sidebarNav}
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50">
          <div className="flex-1 md:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className="font-bold text-xl">ToolifyAI</span>
            </Link>
          </div>
          <div className="w-full flex-1 hidden md:block">
            {/* Can add search or other header elements here if needed */}
          </div>
          <div className="flex items-center gap-2 md:gap-4 justify-end flex-1">
             <ModeToggle />
            <div className="hidden md:flex items-center gap-2">
                 <Button variant="outline" size="icon" className="h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Toggle notifications</span>
                 </Button>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback>{userData?.firstName?.[0] || 'A'}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || ''}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => router.push(`/settings`)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => router.push(`/my-favorites`)}>
                      <Star className="mr-2 h-4 w-4" />
                      <span>My Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                       <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
             <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col p-0">
                 <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                 </SheetHeader>
                {mobileNavContent}
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
           {children}
        </main>
      </div>
    </div>
  );
}
