
'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { getSettings } from '@/ai/flows/settings-management';
import type { FooterSettings, SocialLinks } from '@/ai/flows/settings-management.types';

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
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [copyrightText, setCopyrightText] = useState('');
  
  useEffect(() => {
    async function fetchFooterSettings() {
        try {
            const appSettings = await getSettings();
            setSettings(appSettings.footer ?? null);
            setSocialLinks(appSettings.general?.socialLinks ?? null);
            const rawCopyright = appSettings.general?.copyrightText || `© {year} ToolifyAI. All rights reserved.`;
            setCopyrightText(rawCopyright.replace('{year}', new Date().getFullYear().toString()));
        } catch (error) {
            console.error("Failed to fetch footer settings:", error);
        }
    }
    fetchFooterSettings();
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            {settings?.showLogo && (
                 <Link href="/" className="flex items-center gap-2 mb-4">
                    <Logo />
                    <span className="font-bold text-xl">ToolifyAI</span>
                </Link>
            )}
            {settings?.description && (
                <p className="text-sm text-muted-foreground mb-6">
                    {settings.description}
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
             {settings?.topTools && settings.topTools.length > 0 && (
                <FooterLinkColumn title="Top Tools" links={settings.topTools} />
             )}
              {settings?.quickLinks && settings.quickLinks.length > 0 && (
                <FooterLinkColumn title="Quick Links" links={settings.quickLinks} />
             )}
             {settings?.moreTools && settings.moreTools.length > 0 && (
                <FooterLinkColumn title="More Tools" links={settings.moreTools} />
             )}
               {settings?.hostingLinks && settings.hostingLinks.length > 0 && (
                <FooterLinkColumn title="Best Hostings" links={settings.hostingLinks} />
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
