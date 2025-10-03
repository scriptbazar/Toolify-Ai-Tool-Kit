
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileCode, Download, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

export function XmlSitemapGenerator() {
    const [urls, setUrls] = useState('');
    const [sitemap, setSitemap] = useState('');
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!urls.trim()) {
            toast({ title: "URL list is empty", description: "Please enter at least one URL.", variant: "destructive" });
            return;
        }

        const urlList = urls.split('\n').filter(u => u.trim() !== '');

        const urlset = urlList.map(url => {
            let loc;
            try {
                // Validate and format URL
                loc = new URL(url.trim()).href;
            } catch (e) {
                // If it's a relative path, assume a base
                loc = new URL(url.trim(), 'https://example.com').href.replace('https://example.com', '');
            }
            
            return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.80</priority>
  </url>`;
        }).join('');

        const fullSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}
</urlset>`;
        
        setSitemap(fullSitemap);
        toast({ title: "Sitemap Generated!" });
    };

    const handleDownload = () => {
        if (!sitemap) {
            toast({ title: "Nothing to download", variant: "destructive" });
            return;
        }
        const blob = new Blob([sitemap], { type: 'application/xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sitemap.xml';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleCopy = () => {
        if (!sitemap) {
            toast({ title: "Nothing to copy", variant: "destructive" });
            return;
        }
        navigator.clipboard.writeText(sitemap);
        toast({ title: 'Sitemap content copied to clipboard!' });
    };
    
    const handleClear = () => {
        setUrls('');
        setSitemap('');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="urls-input">Enter URLs (one per line)</Label>
                    <Textarea 
                        id="urls-input"
                        value={urls}
                        onChange={e => setUrls(e.target.value)}
                        placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/contact"
                        className="min-h-[300px] font-mono"
                    />
                </div>
                <Button onClick={handleGenerate} className="w-full">
                    <FileCode className="mr-2 h-4 w-4" /> Generate Sitemap
                </Button>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="sitemap-output">Generated sitemap.xml</Label>
                    <Textarea 
                        id="sitemap-output"
                        value={sitemap} 
                        readOnly 
                        className="min-h-[300px] font-mono bg-muted"
                        placeholder="Your generated XML sitemap will appear here."
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleCopy} variant="outline" disabled={!sitemap}><Copy className="mr-2 h-4 w-4"/> Copy</Button>
                    <Button onClick={handleDownload} disabled={!sitemap}><Download className="mr-2 h-4 w-4"/> Download</Button>
                    <Button onClick={handleClear} variant="destructive" disabled={!urls && !sitemap}><Trash2 className="mr-2 h-4 w-4"/> Clear</Button>
                </div>
            </div>
        </div>
    );
}
