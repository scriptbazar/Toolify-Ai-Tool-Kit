
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

export default function Header() {
  const { user, userData, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session-logout', { method: 'POST' });
      toast({ title: 'Logged out successfully.' });
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold text-xl tracking-tight">ToolifyAI</span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center space-x-1">
          {mainNavLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              className="font-medium text-sm"
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <ModeToggle />

          {/* Corrected logic: only show login/signup if NOT loading and user is NULL */}
          {!loading && !user && (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-bold">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="font-bold">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Show profile dropdown if NOT loading and user is NOT NULL */}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full ring-2 ring-primary/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userData?.firstName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.firstName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer w-full">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer w-full">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-4">
                  {mainNavLinks.map((link) => (
                    <Button key={link.href} asChild variant="ghost" onClick={() => setIsOpen(false)}>
                      <Link href={link.href} className="justify-start">
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                  {!loading && !user && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild onClick={() => setIsOpen(false)}>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
