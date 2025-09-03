
'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { getSettings } from '@/ai/flows/settings-management';
import type { FooterSettings, SocialLinks, AdvertisementSettings } from '@/ai/flows/settings-management.types';
import { AdPlaceholder } from './AdPlaceholder';

const FooterLinkColumn = ({ title, links }: { title: string, links: { name: string, href: string }[] }) => (
    <div>
        <h3 className="font-semibold mb-4">{title}</h3>
        <ul className="space-y-3">
            {links.map((link) => (
                <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

export default function Footer() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [copyrightText, setCopyrightText] = useState('');
  const [adSettings, setAdSettings] = useState<AdvertisementSettings | null>(null);
  
  useEffect(() => {
    async function fetchSettings() {
        try {
            const appSettings = await getSettings();
            setFooterSettings(appSettings.footer ?? null);
            setSocialLinks(appSettings.general?.socialLinks ?? null);
            setAdSettings(appSettings.advertisement ?? null);
            const rawCopyright = appSettings.general?.copyrightText || `© {year} ToolifyAI. All rights reserved.`;
            setCopyrightText(rawCopyright.replace('{year}', new Date().getFullYear().toString()));
        } catch (error) {
            console.error("Failed to fetch footer settings:", error);
        }
    }
    fetchSettings();
  }, []);

  const socialIcons = [
    { name: 'Facebook', href: socialLinks?.facebook, icon: Facebook },
    { name: 'Twitter', href: socialLinks?.twitter, icon: Twitter },
    { name: 'Instagram', href: socialLinks?.instagram, icon: Instagram },
    { name: 'YouTube', href: socialLinks?.youtube, icon: Youtube },
  ].filter(link => link.href);

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <AdPlaceholder adSlotId="footer-banner" adSettings={adSettings} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            {footerSettings?.showLogo && (
                 <Link href="/" className="flex items-center gap-2 mb-4">
                    <Logo />
                    <span className="font-bold text-xl">ToolifyAI</span>
                </Link>
            )}
            {footerSettings?.description && (
                <p className="text-sm text-muted-foreground mb-6">
                    {footerSettings.description}
                </p>
            )}
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-3">
              {socialIcons.map((social) => (
                <Link key={social.name} href={social.href!} className="text-muted-foreground hover:text-primary transition-colors">
                  <social.icon className="h-5 w-5" />
                   <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
             {footerSettings?.topTools && footerSettings.topTools.length > 0 && (
                <FooterLinkColumn title="Top Tools" links={footerSettings.topTools} />
             )}
              {footerSettings?.quickLinks && footerSettings.quickLinks.length > 0 && (
                <FooterLinkColumn title="Quick Links" links={footerSettings.quickLinks} />
             )}
             {footerSettings?.moreTools && footerSettings.moreTools.length > 0 && (
                <FooterLinkColumn title="More Tools" links={footerSettings.moreTools} />
             )}
               {footerSettings?.hostingLinks && footerSettings.hostingLinks.length > 0 && (
                <FooterLinkColumn title="Best Hostings" links={footerSettings.hostingLinks} />
             )}
          </div>
        </div>
      </div>
       <div className="border-t border-border/50">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            {copyrightText}
          </div>
        </div>
    </footer>
  );
}

    