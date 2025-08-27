
'use client';

import {
  Bell,
  Home,
  LineChart,
  Package2,
  Settings,
  Users,
  PenSquare,
  Package,
  History,
  GitCommitVertical,
  Megaphone,
  DatabaseBackup,
  Shield,
  Star,
  Mail,
  BookText,
  UserCog,
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
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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

  const navLinks = [
    { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/tools', icon: Package, label: 'Tool Management' },
    { href: '/admin/prompt-templates', icon: PenSquare, label: 'Prompt Templates' },
    { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
    { href: '/admin/ticket-management', icon: Ticket, label: 'Ticket Management'},
    { href: '/admin/payment-history', icon: History, label: 'Payment History' },
    { href: '/admin/referral-management', icon: GitCommitVertical, label: 'Referral Management' },
    { href: '/admin/advertisement', icon: Megaphone, label: 'Advertisement' },
    { href: '/admin/backup-restore', icon: DatabaseBackup, label: 'Backup & Restore' },
    { href: '/admin/administrators', icon: UserCog, label: 'Administrators' },
    { href: '/admin/review-management', icon: Star, label: 'Review Management' },
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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">ToolifyAI</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === link.href && 'bg-muted text-primary'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <Accordion type="single" collapsible defaultValue={isEmailRouteActive ? 'email-management' : undefined}>
                <AccordionItem value="email-management" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline',
                      isEmailRouteActive && 'bg-muted text-primary'
                  )}>
                     <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <span>Email Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 pt-1">
                    <nav className="grid gap-1">
                    {emailManagementLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                          pathname === link.href && 'bg-muted text-primary'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
               <Accordion type="single" collapsible defaultValue={isBlogRouteActive ? 'blog-management' : undefined}>
                <AccordionItem value="blog-management" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline',
                      isBlogRouteActive && 'bg-muted text-primary'
                  )}>
                     <div className="flex items-center gap-3">
                      <BookText className="h-4 w-4" />
                      <span>Blog Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 pt-1">
                    <nav className="grid gap-1">
                    {blogManagementLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                          pathname === link.href && 'bg-muted text-primary'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible defaultValue={isSettingsRouteActive ? 'settings' : undefined}>
                <AccordionItem value="settings" className="border-b-0">
                  <AccordionTrigger className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline',
                      isSettingsRouteActive && 'bg-muted text-primary'
                  )}>
                     <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 pt-1">
                    <nav className="grid gap-1">
                    {settingsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                          pathname === link.href && 'bg-muted text-primary'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
            <SheetContent side="left" className="flex flex-col">
               <SheetHeader className="text-left">
                  <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">ToolifyAI</span>
                </Link>
                 {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                      pathname === link.href && 'bg-muted text-foreground'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                {/* Mobile Blog Management Accordion could be added here if needed */}
                 <Link
                    href={'/admin/blog-management'}
                    className={cn(
                      'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                       isBlogRouteActive && 'bg-muted text-foreground'
                    )}
                  >
                    <BookText className="h-5 w-5" />
                    Blog Management
                  </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* You can add a search bar here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
