
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Newspaper, Mail, DollarSign, User, LogOut, Lightbulb } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const mainNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/request-a-tool', label: 'Request a Tool', icon: Lightbulb },
  { href: '/contact-us', label: 'Contact Us', icon: Mail },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
];

const NavLinks = ({ isMobile = false, onClick }: { isMobile?: boolean; onClick?: () => void }) => {
  const pathname = usePathname();
  return (
    <>
      {mainNavLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Button
            key={link.href}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-base',
              !isMobile && 'text-sm w-auto font-medium'
            )}
            onClick={onClick}
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
  const { user, userData, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/session-logout', { method: 'POST' });
    toast({ title: 'Logged out successfully.' });
    window.location.href = '/';
  };
  
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold text-xl tracking-tight">ToolifyAI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-1">
          <NavLinks />
        </nav>

        {/* Right Actions Section */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex">
            <ModeToggle />
          </div>

          {loading ? (
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
          ) : !user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-medium">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="font-medium">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-primary/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userData?.firstName?.[0] || userData?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.firstName || userData?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            {!user && (
               <Button asChild variant="ghost" size="sm" className="px-3">
                  <Link href="/login">Login</Link>
               </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col p-0 w-[280px]">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <Logo />
                      <span className="font-bold text-xl">ToolifyAI</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="flex flex-col space-y-2">
                    <NavLinks isMobile={true} onClick={() => setIsOpen(false)} />
                  </nav>
                </div>
                <div className="mt-auto p-4 border-t bg-muted/20">
                  <div className="flex flex-col gap-2">
                    {!user ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild onClick={() => setIsOpen(false)}>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="secondary" onClick={() => setIsOpen(false)}>
                          <Link href={dashboardHref}>Dashboard</Link>
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
