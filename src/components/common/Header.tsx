'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sprout } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';

const NavLinks = () => {
  const pathname = usePathname();
  const authRoutes = ['/login', '/signup', '/admin/login'];

  if (authRoutes.includes(pathname) || pathname.startsWith('/admin')) {
    return null;
  }
  
  return (
    <>
      <Link
        href="/#text"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Text
      </Link>
      <Link
        href="/#pdf"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        PDF
      </Link>
      <Link
        href="/#ai"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        AI
      </Link>
      <Link
        href="/#dev"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Dev
      </Link>
      <Link
        href="/ai-prompt-templates"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Prompt Templates
      </Link>
    </>
  );
};

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const authRoutes = ['/login', '/signup', '/admin/login'];
  const isAdminRoute = pathname.startsWith('/admin');

  const showNav = !authRoutes.includes(pathname) && !isAdminRoute;


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold">ToolifyAI</span>
          </Link>
        </div>

        {isMobile ? (
          <>
            {showNav && (
            <div className="flex flex-1 items-center justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="mt-8 flex flex-col space-y-4">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            )}
          </>
        ) : (
          <>
           {showNav && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <NavLinks />
            </nav>
           )}
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
