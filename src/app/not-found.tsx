
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-6xl font-extrabold text-primary">404</CardTitle>
              <CardDescription className="text-xl font-semibold">
                Page Not Found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground mb-6">
                Oops! The page you are looking for does not exist. It might have been moved, deleted, or you might have mistyped the URL.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" /> Go to Homepage
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="relative hidden md:block">
            <Image
              src="https://picsum.photos/600/800"
              alt="Abstract image representing a lost page"
              fill
              className="object-cover"
              data-ai-hint="abstract texture"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
