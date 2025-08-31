'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogIn, Menu, UserPlus, Home, LayoutGrid, Newspaper, Info, Mail, DollarSign, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';


const mainNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tools', label: 'Features', icon: LayoutGrid },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/about-us', label: 'About Us', icon: Info },
  { href: '/contact-us', label: 'Contact Us', icon: Mail },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/community-chat', label: 'Community Chat', icon: MessageSquare },
];


const NavLinks = ({ isMobile = false }) => {
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
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

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
                       <NavLinks isMobile={true} />
                    </nav>
                  </div>
                   <div className="mt-auto p-4 border-t">
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" className="flex-1">
                           <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log in</Link>
                        </Button>
                        <Button asChild className="flex-1">
                           <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                        </Button>
                      </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            </div>
        ) : (
          <>
            <div className="flex-1 md:flex-initial">
              <Link href="/" className="flex items-center space-x-2">
                <Logo />
                <span className="font-bold text-xl">ToolifyAI</span>
              </Link>
            </div>
            <nav className="flex flex-1 items-center justify-center space-x-1 text-sm font-medium">
              <NavLinks />
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-2">
            {!isAdminRoute && (
              <>
                <ModeToggle />
                <Button asChild variant="ghost">
                  <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
                </Button>
              </>
            )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
