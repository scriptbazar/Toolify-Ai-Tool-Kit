
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

const NavLinks = () => {
  const pathname = usePathname();
  const navLinks = [
    { href: '/#text', label: 'Text' },
    { href: '/#pdf', label: 'PDF' },
    { href: '/#ai', label: 'AI' },
    { href: '/#dev', label: 'Dev' },
  ];

  return (
    <>
      {navLinks.map((link) => {
        // A simple way to check for active hash links.
        // In a real app, you might want a more robust solution using IntersectionObserver.
        const isActive = pathname === '/' && link.label === 'Text'; // Example for active state

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            )}
          >
            {link.label}
          </Link>
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
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold">ToolifyAI</span>
          </Link>
        </div>

        {isMobile ? (
          <>
            <div className="flex flex-1 items-center justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                     <SheetTitle>
                      <Link href="/" className="flex items-center space-x-2">
                        <Logo />
                        <span className="font-bold">ToolifyAI</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 flex flex-col space-y-2">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <>
            <nav className="flex items-center space-x-2 text-sm font-medium">
              <NavLinks />
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-4">
            {!isAdminRoute && (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
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
