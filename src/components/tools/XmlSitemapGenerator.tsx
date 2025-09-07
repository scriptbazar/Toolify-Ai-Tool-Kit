
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

export function XmlSitemapGenerator() {
    const [url, setUrl] = useState('');
    const [sitemap, setSitemap] = useState('');
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!url) {
            toast({ title: "URL is required", variant: "destructive" });
            return;
        }
        // Dummy data for demonstration. A real implementation would crawl the site server-side.
        const dummySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>1.00</priority>
   </url>
   <url>
      <loc>${url}/page1</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>0.80</priority>
   </url>
   <url>
      <loc>${url}/page2</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>0.80</priority>
   </url>
</urlset>`;
        setSitemap(dummySitemap);
    };

    const handleDownload = () => {
        const blob = new Blob([sitemap], { type: 'application/xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sitemap.xml';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
                <Button onClick={handleGenerate}><FileCode className="mr-2 h-4 w-4" /> Generate Sitemap</Button>
            </div>
            {sitemap && (
                <div>
                    <Label>Generated sitemap.xml</Label>
                    <Textarea value={sitemap} readOnly className="min-h-[300px] font-mono bg-muted" />
                    <Button onClick={handleDownload} className="mt-2"><Download className="mr-2 h-4 w-4"/> Download sitemap.xml</Button>
                </div>
            )}
        </div>
    );
}
