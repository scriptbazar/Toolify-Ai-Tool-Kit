

'use client';

import {
  Bell,
  Home,
  LineChart,
  Settings,
  Users,
  PenSquare,
  Package,
  History,
  GitCommitVertical,
  Megaphone,
  DatabaseBackup,
  UserCog,
  Star,
  Mail,
  BookText,
  Ticket,
  FileText as FileTextIcon,
  PlusCircle,
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Cog,
  UserPlus,
  SlidersHorizontal,
  ListChecks,
  CreditCard,
  FileCog,
  LogOut,
  User,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CircleUser, Menu } from 'lucide-react';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);

  const isLoginPage = pathname === '/admin/login';


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as AppUser);
        }
      } else if (!isLoginPage) {
        setUser(null);
        setUserData(null);
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router, isLoginPage]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
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

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/tools', label: 'Tool Management', icon: Package },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
    { href: '/admin/ticket-management', label: 'Ticket Management', icon: Ticket },
    { href: '/admin/community-chat', label: 'Community Chat', icon: MessageSquare },
    { href: '/admin/payment-history', label: 'Payment History', icon: History },
    { href: '/admin/referral-management', label: 'Referral Management', icon: GitCommitVertical },
    { href: '/admin/review-management', label: 'Review Management', icon: Star },
    { href: '/admin/advertisement', label: 'Advertisement', icon: Megaphone },
    { href: '/admin/backup-restore', label: 'Backup & Restore', icon: DatabaseBackup },
  ];

  const blogManagementLinks = [
    { href: '/admin/blog/all-posts', icon: FileTextIcon, label: 'All Posts' },
    { href: '/admin/blog/add-new', icon: PlusCircle, label: 'Add New Post' },
    { href: '/admin/blog/categories', icon: LayoutGrid, label: 'Categories' },
    { href: '/admin/blog/comments', icon: MessageSquare, label: 'Comments' },
  ];

  const emailManagementLinks = [
    { href: '/admin/email/templates', icon: FileTextIcon, label: 'Email Templates' },
    { href: '/admin/email/subscribers', icon: UserPlus, label: 'Subscribers' },
    { href: '/admin/email/compose', icon: PenSquare, label: 'Compose' },
    { href: '/admin/email/all-emails', icon: History, label: 'All Emails' },
    { href: '/admin/email/reports', icon: BarChart3, label: 'Email Reports' },
    { href: '/admin/email/settings', icon: Cog, label: 'Mail Settings' },
  ];
  
  const settingsLinks = [
    { href: '/admin/settings/site', icon: SlidersHorizontal, label: 'Site Settings' },
    { href: '/admin/settings/plan', icon: ListChecks, label: 'Plan Management' },
    { href: '/admin/settings/payment', icon: CreditCard, label: 'Payment Settings' },
    { href: '/admin/settings/page', icon: FileCog, label: 'Page Management' },
  ];

  const isBlogRouteActive = pathname.startsWith('/admin/blog');
  const isEmailRouteActive = pathname.startsWith('/admin/email');
  const isSettingsRouteActive = pathname.startsWith('/admin/settings');
  
  const SubmenuItems = ({ links }: { links: { href: string; icon: React.ElementType; label: string }[] }) => (
     <nav className="grid gap-1">
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground relative',
            pathname === link.href && 'bg-accent text-accent-foreground'
          )}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-[22px] flex justify-center">
            {index !== links.length - 1 && <div className="w-px h-full bg-border" />}
          </div>
           <div className="absolute left-[22px] top-1/2 -translate-y-1/2 w-3 h-px bg-border"/>
          <link.icon className="h-4 w-4 ml-8" />
          {link.label}
        </Link>
      ))}
    </nav>
  );

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
        <nav className="grid gap-2 text-base font-medium p-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                pathname === link.href && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          <Accordion type="single" collapsible defaultValue={isEmailRouteActive ? 'email-management' : undefined} className="w-full">
            <AccordionItem value="email-management" className="border-b-0">
              <AccordionTrigger className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                  isEmailRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}>
                 <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5" />
                  <span>Email Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 pt-1">
                 <SubmenuItems links={emailManagementLinks} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible defaultValue={isBlogRouteActive ? 'blog-management' : undefined} className="w-full">
            <AccordionItem value="blog-management" className="border-b-0">
              <AccordionTrigger className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                  isBlogRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}>
                 <div className="flex items-center gap-4">
                  <BookText className="h-5 w-5" />
                  <span>Blog Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 pt-1">
                 <SubmenuItems links={blogManagementLinks} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible defaultValue={isSettingsRouteActive ? 'settings' : undefined} className="w-full">
            <AccordionItem value="settings" className="border-b-0">
              <AccordionTrigger className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                  isSettingsRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              )}>
                 <div className="flex items-center gap-4">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 pt-1">
                 <SubmenuItems links={settingsLinks} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4 border-t">
          <div className="flex gap-2">
            <Button asChild className="flex-1 justify-start">
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                Admin Profile
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1 justify-start">
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
              <Accordion type="single" collapsible defaultValue={isEmailRouteActive ? 'email-management' : undefined}>
                <AccordionItem value="email-management" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                      isEmailRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}>
                     <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <span>Email Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pl-4">
                     <SubmenuItems links={emailManagementLinks} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
               <Accordion type="single" collapsible defaultValue={isBlogRouteActive ? 'blog-management' : undefined}>
                <AccordionItem value="blog-management" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                      isBlogRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}>
                     <div className="flex items-center gap-3">
                      <BookText className="h-4 w-4" />
                      <span>Blog Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pl-4">
                     <SubmenuItems links={blogManagementLinks} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible defaultValue={isSettingsRouteActive ? 'settings' : undefined}>
                <AccordionItem value="settings" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:no-underline',
                      isSettingsRouteActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}>
                     <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pl-4">
                     <SubmenuItems links={settingsLinks} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </nav>
          </ScrollArea>
           <div className="mt-auto p-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button asChild className="w-full justify-center">
                  <Link href="/admin/profile">
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
                  <span className="sr-only">Toggle navigation menu</span>
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
                     <AvatarFallback>{userData?.firstName?.[0] || 'A'}</AvatarFallback>
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
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span>Admin Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${user?.uid}`)}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Edit Admin Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
