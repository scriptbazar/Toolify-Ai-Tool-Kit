
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

export function XmlSitemapGenerator() {
    const [url, setUrl] = useState('');
    const [sitemap, setSitemap] = useState('');
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!url.trim()) {
            toast({ title: "URL is required", description: "Please enter your website's base URL.", variant: "destructive" });
            return;
        }

        let fullUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            fullUrl = `https://${url}`;
        }
        
        try {
            // Validate URL
            new URL(fullUrl);
        } catch (e) {
            toast({ title: "Invalid URL", description: "Please enter a valid website URL.", variant: "destructive" });
            return;
        }

        // Dummy data for demonstration. A real implementation would crawl the site server-side.
        const dummySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>${fullUrl}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>1.00</priority>
   </url>
   <url>
      <loc>${fullUrl}/about</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>0.80</priority>
   </url>
   <url>
      <loc>${fullUrl}/contact</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <priority>0.80</priority>
   </url>
</urlset>`;
        setSitemap(dummySitemap);
        toast({ title: "Sitemap Generated", description: "A basic sitemap has been created based on your URL." });
    };

    const handleDownload = () => {
        if (!sitemap) {
            toast({ title: "Nothing to download", description: "Please generate a sitemap first.", variant: "destructive" });
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
             toast({ title: "Nothing to copy", description: "Please generate a sitemap first.", variant: "destructive" });
            return;
        }
        navigator.clipboard.writeText(sitemap);
        toast({ title: 'Sitemap content copied to clipboard!' });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="website-url">Your Website's Base URL</Label>
                <div className="flex gap-2">
                    <Input 
                        id="website-url"
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        placeholder="https://example.com" 
                    />
                    <Button onClick={handleGenerate}>
                        <FileCode className="mr-2 h-4 w-4" /> Generate Sitemap
                    </Button>
                </div>
            </div>
            
            {(sitemap) && (
                <div>
                    <Label htmlFor="sitemap-output">Generated sitemap.xml</Label>
                    <Textarea 
                        id="sitemap-output"
                        value={sitemap} 
                        readOnly 
                        className="min-h-[300px] font-mono bg-muted mt-2" 
                    />
                    <div className="flex gap-2 mt-2">
                        <Button onClick={handleCopy} variant="outline" className="w-full">
                            <Copy className="mr-2 h-4 w-4"/> Copy
                        </Button>
                        <Button onClick={handleDownload} className="w-full">
                            <Download className="mr-2 h-4 w-4"/> Download sitemap.xml
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
