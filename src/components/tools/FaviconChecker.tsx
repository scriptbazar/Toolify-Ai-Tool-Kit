
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

export function FaviconChecker() {
    const [url, setUrl] = useState('');
    const [favicon, setFavicon] = useState<string | null>(null);
    const [status, setStatus] = useState<'found' | 'not-found' | 'idle'>('idle');
    const { toast } = useToast();

    const handleCheck = () => {
        if (!url) {
            toast({ title: 'Please enter a website URL.', variant: 'destructive' });
            return;
        }
        
        // In a real app, this would be a server-side call to avoid CORS issues.
        // We'll simulate finding a favicon for demonstration purposes.
        try {
            const domain = new URL(url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
            setFavicon(faviconUrl);
            setStatus('found');
        } catch (e) {
            toast({ title: 'Invalid URL', description: 'Please enter a valid URL (e.g., https://example.com)', variant: 'destructive' });
            setStatus('not-found');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input 
                    id="url-input" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    placeholder="https://example.com" 
                />
                <Button onClick={handleCheck}>
                    <Search className="mr-2 h-4 w-4" /> Check Favicon
                </Button>
            </div>

            {status !== 'idle' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status === 'found' && favicon ? (
                            <div className="flex items-center gap-4">
                                <Image src={favicon} alt="Favicon" width={64} height={64} className="rounded-lg border" />
                                <div>
                                    <p className="flex items-center gap-2 text-green-600 font-semibold"><Check/> Favicon found!</p>
                                    <p className="text-sm text-muted-foreground break-all">Source: {favicon}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="flex items-center gap-2 text-red-600 font-semibold"><X/> No favicon found for this URL.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
