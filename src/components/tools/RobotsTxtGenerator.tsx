
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RobotsTxtGenerator() {
    const [robotsTxt, setRobotsTxt] = useState(`User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml`);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(robotsTxt);
        toast({ title: 'Robots.txt content copied!' });
    };

    return (
        <div className="space-y-4">
            <Label htmlFor="robots-txt">Your robots.txt</Label>
            <Textarea id="robots-txt" value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} className="min-h-[300px] font-mono" />
            <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy to Clipboard</Button>
        </div>
    );
}
