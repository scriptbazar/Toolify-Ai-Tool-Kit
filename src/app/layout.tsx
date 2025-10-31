

import type { Metadata } from 'next';
import './globals.css';
import { Inter, Cedarville_Cursive, Dancing_Script, Indie_Flower, Kalam, Marck_Script, Nanum_Pen_Script, Patrick_Hand, Permanent_Marker, Rock_Salt, Sacramento, Caveat, Pacifico, Homemade_Apple, Zeyada } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getSettings } from '@/ai/flows/settings-management';
import Script from 'next/script';
import { Providers } from '@/components/common/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const cedarville = Cedarville_Cursive({ weight: '400', subsets: ['latin'], variable: '--font-cedarville', display: 'swap' });
const dancing = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing', display: 'swap' });
const indie = Indie_Flower({ weight: '400', subsets: ['latin'], variable: '--font-indie', display: 'swap' });
const kalam = Kalam({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-kalam', display: 'swap' });
const marck = Marck_Script({ weight: '400', subsets: ['latin'], variable: '--font-marck', display: 'swap' });
const nanum = Nanum_Pen_Script({ weight: '400', subsets: ['latin'], variable: '--font-nanum', display: 'swap' });
const patrick = Patrick_Hand({ weight: '400', subsets: ['latin'], variable: '--font-patrick', display: 'swap' });
const permanent = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-permanent', display: 'swap' });
const rocksalt = Rock_Salt({ weight: '400', subsets: ['latin'], variable: '--font-rocksalt', display: 'swap' });
const sacramento = Sacramento({ weight: '400', subsets: ['latin'], variable: '--font-sacramento', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-pacifico', display: 'swap' });
const homemadeApple = Homemade_Apple({ weight: '400', subsets: ['latin'], variable: '--font-homemade-apple', display: 'swap' });
const zeyada = Zeyada({ weight: '400', subsets: ['latin'], variable: '--font-zeyada', display: 'swap' });

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
          inter.variable,
          cedarville.variable,
          dancing.variable,
          indie.variable,
          kalam.variable,
          marck.variable,
          nanum.variable,
          patrick.variable,
          permanent.variable,
          rocksalt.variable,
          sacramento.variable,
          caveat.variable,
          pacifico.variable,
          homemadeApple.variable,
          zeyada.variable
        )}
      >
        <Providers>
            {children}
        </Providers>
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
