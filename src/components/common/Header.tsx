
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogIn, Menu, UserPlus, Home, LayoutGrid, Newspaper, Info, Mail, DollarSign, MessageSquare, User, LayoutDashboard, LogOut as LogoutIcon, ShieldCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { UserNav } from './UserNav';
import { doc, getDoc } from 'firebase/firestore';


const mainNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#features', label: 'Features', icon: LayoutGrid },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/about-us', label: 'About Us', icon: Info },
  { href: '/contact-us', label: 'Contact Us', icon: Mail },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
];

const NavLinks = ({ isMobile = false, isLoggedIn = false, isAdmin = false }) => {
  const pathname = usePathname();

  const allLinks = isLoggedIn 
    ? [...mainNavLinks, { href: '/community-chat', label: 'Community Chat', icon: MessageSquare }]
    : mainNavLinks;

  return (
    <>
      {allLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Button
            key={link.href}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-base',
              !isMobile &&
                'text-sm w-auto'
            )}
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </>
  );
};

export default function Header() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logged out successfully.' });
    router.push('/');
  };
  
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        {isMobile ? (
           <div className="container flex h-16 items-center px-0">
            <div className="flex-1">
              <Link href="/" className="flex items-center space-x-2">
                <Logo />
                <span className="font-bold text-xl">ToolifyAI</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
               <ModeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-0 w-[280px]">
                  <SheetHeader className="p-4 border-b">
                     <SheetTitle>
                      <Link href="/" className="flex items-center space-x-2">
                        <Logo />
                        <span className="font-bold text-xl">ToolifyAI</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4">
                    <nav className="flex flex-col space-y-2">
                       <NavLinks isMobile={true} isLoggedIn={!!user} isAdmin={isAdmin} />
                    </nav>
                  </div>
                   <div className="mt-auto p-4 border-t">
                      <div className="flex flex-col gap-2">
                        {loading ? null : !user ? (
                          <>
                           <Button asChild variant="ghost" className="flex-1 justify-start">
                             <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log in</Link>
                           </Button>
                           <Button asChild className="flex-1 justify-start">
                             <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                           </Button>
                          </>
                        ) : (
                          <>
                            <Button asChild variant="secondary" className="justify-start">
                              <Link href={dashboardHref}>
                                  {isAdmin ? <ShieldCheck className="mr-2 h-4 w-4"/> : <LayoutDashboard className="mr-2 h-4 w-4"/>}
                                  {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" className="justify-start">
                               <Link href={isAdmin ? '/admin/profile' : '/profile'}>
                                  <User className="mr-2 h-4 w-4"/>
                                  Profile
                               </Link>
                            </Button>
                            <Button variant="destructive" onClick={handleLogout} className="justify-start">
                                <LogoutIcon className="mr-2 h-4 w-4"/>
                                Logout
                            </Button>
                          </>
                        )}
                      </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            </div>
        ) : (
          <>
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Logo />
                <span className="font-bold text-xl">ToolifyAI</span>
              </Link>
            </div>
            <nav className="flex-1 flex items-center justify-center space-x-1 text-sm font-medium">
              <NavLinks isLoggedIn={!!user} isAdmin={isAdmin} />
            </nav>
            <div className="flex items-center justify-end gap-2">
               <ModeToggle />
               {loading ? <div className="h-8 w-8 rounded-full bg-muted animate-pulse" /> : !user ? (
                  <>
                    <Button asChild variant="ghost">
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
                    </Button>
                  </>
                ) : (
                   <UserNav user={user} onLogout={handleLogout} />
                )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
