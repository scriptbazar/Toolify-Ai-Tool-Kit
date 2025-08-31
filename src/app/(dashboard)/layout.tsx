
'use client';

import {
  Home,
  Star,
  Ticket,
  MessageSquare,
  LogOut,
  User,
  Settings,
  GitCommitVertical,
  Heart,
  Mail,
  FileText,
  History,
  CreditCard,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/common/Logo';
import { ModeToggle } from '@/components/common/ModeToggle';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface AppUser {
  firstName: string;
  lastName: string;
  email: string;
  role?: 'user' | 'admin';
}


export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const fetchedUserData = userDocSnap.data() as AppUser;
          // If a user with 'admin' role tries to access the user dashboard,
          // redirect them to the admin dashboard.
          if (fetchedUserData.role === 'admin') {
            router.replace('/admin/dashboard');
            return; // Stop further processing for this user
          }
          setUser(firebaseUser);
          setUserData(fetchedUserData);
        } else {
            // This case handles if a user is authenticated but has no Firestore document.
            // It's safer to log them out and ask to log in again.
            toast({
              title: "Authentication Error",
              description: "Could not find your user details. Please log in again.",
              variant: "destructive",
            });
            await signOut(auth); // Log out the user
            router.push('/login');
            return;
        }
      } else {
        // No user is signed in.
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
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
  
  if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading user dashboard...</p>
        </div>
      );
  }

  if (!user || !userData) {
    // This state can be reached if the user is being redirected.
    // Showing a loading state prevents flashing the UI before redirection is complete.
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Redirecting...</p>
        </div>
      );
  }
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/community-chat', label: 'Community Chat', icon: MessageSquare },
    { href: '/my-tickets', label: 'My Tickets', icon: Ticket },
    { href: '/my-media', label: 'My Media', icon: FileText },
    { href: '/usage-history', label: 'Usage History', icon: History },
    { href: '/payment-history', label: 'Payment History', icon: CreditCard },
    { href: '/refer-a-friend', label: 'Refer a Friend', icon: GitCommitVertical },
    { href: '/favorites', label: 'My Favorites', icon: Heart },
    { href: '/profile', label: 'Settings', icon: Settings },
    { href: '/manage-subscription', label: 'Manage Subscription', icon: Star },
    { href: '/login-history', label: 'Login History', icon: Mail },
  ];

  const sidebarNav = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="text-lg">ToolifyAI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === link.href && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
       <div className="mt-auto p-4 border-t">
        <Button variant="secondary" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
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
            <SheetContent side="left" className="flex flex-col p-0">
               {sidebarNav}
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">&nbsp;</div>
          <div className="flex items-center gap-4">
            <ModeToggle />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback>{userData?.firstName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
