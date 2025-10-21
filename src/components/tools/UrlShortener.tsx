
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link as LinkIcon, Copy, Trash2, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { createShortUrl } from '@/ai/flows/url-shortener';

export function UrlShortener() {
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleShorten = async () => {
        if (!longUrl) {
            toast({ title: 'URL is required', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            const result = await createShortUrl({ originalUrl: longUrl });
            if (result.shortUrl) {
                setShortUrl(result.shortUrl);
                toast({ title: 'URL Shortened!', description: 'Your short link is ready.' });
            } else {
                throw new Error(result.error || 'Failed to shorten URL');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleClear = () => {
        setLongUrl('');
        setShortUrl('');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>URL Shortener</CardTitle>
                    <CardDescription>Enter a long URL to create a short, shareable link.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="long-url">Long URL</Label>
                        <Input id="long-url" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} placeholder="https://example.com/very/long/url/to/shorten"/>
                    </div>
                    <Button onClick={handleShorten} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                        Shorten URL
                    </Button>
                </CardContent>
            </Card>

            {shortUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Short Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="p-4 bg-muted rounded-md text-primary font-mono text-center truncate">
                            {shortUrl}
                         </div>
                         <div className="flex gap-2">
                            <Button onClick={handleCopy} className="w-full">
                                <Copy className="mr-2 h-4 w-4"/> Copy
                            </Button>
                            <Button variant="destructive" onClick={handleClear} className="w-full">
                                <Trash2 className="mr-2 h-4 w-4"/> Clear
                            </Button>
                         </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
