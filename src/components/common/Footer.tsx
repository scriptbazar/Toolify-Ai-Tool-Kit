import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Logo';
import { getSettings } from '@/ai/flows/settings-management';

const topTools = [
  { name: 'Age Calculator', href: '#' },
  { name: 'Password Generator', href: '#' },
  { name: 'JSON Formatter', href: '/json-formatter' },
  { name: 'Image Converter', href: '/image-converter' },
  { name: 'QR Code Generator', href: '#' },
];

const quickLinks = [
  { name: 'About Us', href: '/pages/about-us' },
  { name: 'Contact Us', href: '/pages/contact-us' },
  { name: 'Privacy Policy', href: '/pages/privacy-policy' },
  { name: 'Terms & Conditions', href: '/pages/terms-conditions' },
  { name: 'DMCA', href: '/pages/dmca' },
];

const moreTools = [
  { name: 'BMI Calculator', href: '#' },
  { name: 'Text to Speech', href: '#' },
  { name: 'PDF Merger', href: '/merge-pdf' },
  { name: 'Unit Converter', href: '#' },
  { name: 'Color Picker', href: '#' },
];

const bestHostings = [
    { name: 'Hostinger', href: '#' },
    { name: 'Hostarmada', href: '#' },
    { name: 'YouStable', href: '#' },
    { name: 'Sitecountry', href: '#' },
    { name: 'Hostwinds', href: '#' },
];

export default async function Footer() {
  const settings = await getSettings();
  const generalSettings = settings.general;
  const copyrightText = generalSettings?.copyrightText?.replace('{year}', new Date().getFullYear().toString()) || `© ${new Date().getFullYear()} ToolifyAI. All rights reserved.`;

  const socialLinks = [
    { name: 'Facebook', href: generalSettings?.socialLinks?.facebook, icon: Facebook },
    { name: 'Twitter', href: generalSettings?.socialLinks?.twitter, icon: Twitter },
    { name: 'Instagram', href: generalSettings?.socialLinks?.instagram, icon: Instagram },
    { name: 'YouTube', href: generalSettings?.socialLinks?.youtube, icon: Youtube },
  ].filter(link => link.href);

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="font-bold text-xl">{generalSettings?.siteTitle || 'ToolifyAI'}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              {generalSettings?.siteDescription || 'ToolifyAI is your go-to hub for powerful, easy-to-use online utilities that simplify everyday tasks. Whether you need converters, analyzers, or creative tools, ToolifyAI connects you to everything in one place.'}
            </p>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link key={social.name} href={social.href!} className="text-muted-foreground hover:text-primary transition-colors">
                  <social.icon className="h-5 w-5" />
                   <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
             <div>
              <h3 className="font-semibold mb-4">Top Tools</h3>
              <ul className="space-y-3">
                {topTools.map((tool) => (
                  <li key={tool.name}>
                    <Link href={tool.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
             <div>
              <h3 className="font-semibold mb-4">More Tools</h3>
              <ul className="space-y-3">
                {moreTools.map((tool) => (
                  <li key={tool.name}>
                    <Link href={tool.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Best Hostings</h3>
              <ul className="space-y-3">
                {bestHostings.map((hosting) => (
                  <li key={hosting.name}>
                    <Link href={hosting.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {hosting.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
