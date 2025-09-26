
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { getSettings } from '@/ai/flows/settings-management';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const generalSettings = settings.general;

  return {
    title: generalSettings?.siteTitle || 'ToolifyAI - Your All-in-One Smart Toolkit',
    description: generalSettings?.siteDescription || 'Over 100 smart utility tools and AI-powered solutions for text, PDF, images, SEO, development, and productivity. Boost your workflow with ToolifyAI.',
    keywords: generalSettings?.metaKeywords || 'ai tools, utility, productivity, developer tools',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const adSettings = settings.advertisement;
  const showAutoAds = adSettings?.adType === 'auto';
  const autoAdsScript = adSettings?.autoAdsScript;

  return (
    <html lang="en" suppressHydrationWarning>
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
          {children}
          <Toaster />
        </ThemeProvider>
        {showAutoAds && autoAdsScript && (
          <Script
            id="auto-ads-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: autoAdsScript }}
          />
        )}
      </body>
    </html>
  );
}
