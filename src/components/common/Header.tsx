
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogIn, Menu, UserPlus, Home, Newspaper, Mail, DollarSign, User, LayoutDashboard, LogOut as LogoutIcon, ShieldCheck, Lightbulb, Star } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
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

const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
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
              !isMobile && 'text-sm w-auto'
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
  const { user, userData, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/session-logout', { method: 'POST' });
    toast({ title: 'Logged out successfully.' });
    window.location.href = '/';
  };
  
  const dashboardHref = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        
        {/* Mobile menu and logo */}
        <div className="flex w-full items-center justify-between md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-xl">ToolifyAI</span>
            </Link>
             <div className="flex items-center space-x-2">
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
                         <NavLinks isMobile={true} />
                      </nav>
                    </div>
                     <div className="mt-auto p-4 border-t">
                        <div className="flex flex-col gap-2">
                          {!loading && !user ? (
                            <div className="grid grid-cols-2 gap-2">
                             <Button asChild variant="ghost" className="flex-1 justify-center">
                               <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log in</Link>
                             </Button>
                             <Button asChild className="flex-1 justify-center">
                               <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                             </Button>
                            </div>
                          ) : !loading && user ? (
                            <div className="grid grid-cols-2 gap-2">
                               <Button asChild variant="secondary" className="justify-center">
                                <Link href={dashboardHref}>
                                    {isAdmin ? <ShieldCheck className="mr-2 h-4 w-4"/> : <LayoutDashboard className="mr-2 h-4 w-4"/>}
                                    {isAdmin ? 'Admin' : 'Dashboard'}
                                </Link>
                              </Button>
                              <Button variant="destructive" onClick={handleLogout} className="justify-center">
                                  <LogoutIcon className="mr-2 h-4 w-4"/>
                                  Logout
                              </Button>
                            </div>
                          ) : null}
                        </div>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex w-full items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-xl">ToolifyAI</span>
            </Link>
          </div>
          <nav className="flex-1 flex items-center justify-center space-x-1 text-sm font-medium">
            <NavLinks />
          </nav>
          <div className="flex items-center justify-end gap-2">
             <ModeToggle />
             {loading ? (
                <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
             ) : !user ? (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
                  </Button>
                </div>
              ) : (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback>{userData?.firstName?.[0] || 'U'}</AvatarFallback>
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
                    <DropdownMenuItem asChild>
                      <Link href={dashboardHref}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {!isAdmin && (
                       <DropdownMenuItem asChild>
                        <Link href="/my-favorites">
                          <Star className="mr-2 h-4 w-4" />
                          <span>My Favorites</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                       <LogoutIcon className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
        </div>
      </div>
    </header>
  );
}
