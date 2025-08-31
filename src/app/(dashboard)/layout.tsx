
'use client';

import {
  Bell,
  Home,
  Star,
  Mail,
  Ticket,
  MessageSquare,
  LogOut,
  User,
  History,
  File,
  Settings,
  CreditCard,
  Heart,
  GitCommitVertical,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/common/Logo';
import { ModeToggle } from '@/components/common/ModeToggle';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

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
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const fetchedUserData = userDocSnap.data() as AppUser;
          if (fetchedUserData.role === 'admin') {
            // If the user is an admin, redirect them away from the user dashboard.
            router.push('/admin/dashboard');
            return; // Stop further processing for this layout
          }
          setUser(firebaseUser);
          setUserData(fetchedUserData);
          setIsAuthorized(true); // User is a regular user and is authorized
        } else {
            // If no user doc, something is wrong, redirect to login
            toast({
              title: "Authentication Error",
              description: "Could not find your user details. Please log in again.",
              variant: "destructive",
            });
            router.push('/login');
        }
      } else {
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
  
  if (loading || !isAuthorized) {
      return <div>Loading...</div>
  }
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/community-chat', label: 'Community Chat', icon: MessageSquare },
    { href: '/my-tickets', label: 'My Tickets', icon: Ticket },
    { href: '/my-media', label: 'My Media', icon: File },
    { href: '/usage-history', label: 'Usage History', icon: History },
    { href: '/payment-history', label: 'Payment History', icon: CreditCard },
    { href: '/refer-a-friend', label: 'Refer a Friend', icon: GitCommitVertical },
    { href: '/favorites', label: 'My Favorites', icon: Heart },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/manage-subscription', label: 'Manage Subscription', icon: Star },
    { href: '/login-history', label: 'Login History', icon: Mail },
  ];

  const sidebarNav = (
    <>
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
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:flex flex-col h-full">
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
             <Avatar className="h-8 w-8">
               <AvatarFallback>{userData?.firstName?.[0] || 'U'}</AvatarFallback>
             </Avatar>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
