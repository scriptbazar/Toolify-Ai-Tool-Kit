
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RobotsTxtGenerator() {
    const [robotsTxt, setRobotsTxt] = useState(`User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml`);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(robotsTxt);
        toast({ title: "Robots.txt content copied!" });
    };
    
    const handleReset = () => {
        setRobotsTxt(`User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml`);
    }

    const handleDownload = () => {
        const blob = new Blob([robotsTxt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'robots.txt';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="robots-txt">Your robots.txt</Label>
                <Textarea id="robots-txt" value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} className="min-h-[300px] font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/> Copy Code</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download robots.txt</Button>
                <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/> Reset to Default</Button>
            </div>
        </div>
    );
}

    

    