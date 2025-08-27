import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { AppProviders } from '@/components/AppProviders';
import { headers } from 'next/headers';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ToolifyAI - Your All-in-One Smart Toolkit',
  description:
    'Over 100 smart utility tools and AI-powered solutions for text, PDF, images, SEO, development, and productivity. Boost your workflow with ToolifyAI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '/';

  const authRoutes = ['/login', '/signup', '/admin/login', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  const isAdminRoute = pathname.startsWith('/admin');

  const isUserPanelRoute = [
    '/dashboard',
    '/profile',
    '/manage-subscription',
    '/payment-history',
    '/settings',
    '/usage-history',
    '/login-history',
    '/my-media',
    '/refer-a-friend',
    '/my-tickets',
    '/create-ticket',
    '/community-chat',
  ].some(route => pathname.startsWith(route));

  const showPublicLayout = !isAuthRoute && !isAdminRoute && !isUserPanelRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            {showPublicLayout && <Header />}
            <div className={cn(showPublicLayout && "flex-1")}>{children}</div>
            {showPublicLayout && <Footer />}
          </AppProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
