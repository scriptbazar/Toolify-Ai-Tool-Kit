
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LogIn, Menu, UserPlus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { toolCategories } from '@/lib/constants';

const NavLinks = ({ isMobile = false }) => {
  const pathname = usePathname();

  return (
    <>
      {toolCategories.slice(0, 4).map((category) => {
        // For demonstration, making 'text' category active.
        // In a real app, this would be dynamic based on scroll position.
        const isActive = pathname === '/' && category.id === 'text';
        const linkHref = `/#${category.id}`;
        return (
          <Button
            key={category.id}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-base',
              !isMobile &&
                'text-sm w-auto'
            )}
          >
            <Link href={linkHref}>
              <category.Icon className="mr-2 h-4 w-4" />
              {category.name.replace(' Tools', '')}
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
                <SheetContent side="right" className="flex flex-col p-0 w-[280px]">
                  <SheetHeader className="p-4 border-b">
                     <SheetTitle>
                      <Link href="/" className="flex items-center space-x-2">
                        <Logo />
                        <span className="font-bold">ToolifyAI</span>
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
                           <Link href="/login"><LogIn className="mr-2" /> Log in</Link>
                        </Button>
                        <Button asChild className="flex-1">
                           <Link href="/signup"><UserPlus className="mr-2" /> Sign Up</Link>
                        </Button>
                      </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <>
            <nav className="flex items-center space-x-1 text-sm font-medium">
              <NavLinks />
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-2">
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
