
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube, Loader2, Search, AlertTriangle, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle } from '../ui/alert';
import { getChannelDetails } from '@/ai/flows/youtube-data';

interface YouTubeDownloaderProps {
    itemToFetch: 'logo' | 'banner';
    title: string;
    description: string;
}

export function YouTubeDownloader({ itemToFetch, title, description }: YouTubeDownloaderProps) {
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const getChannelIdentifier = (inputUrl: string): string | null => {
        if (!inputUrl) return null;
        try {
            const urlObj = new URL(inputUrl);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            if (pathParts[0] === 'channel' && pathParts[1]) return pathParts[1];
            if (pathParts[0]?.startsWith('@')) return pathParts[0].substring(1);
            if (pathParts[0] === 'c' && pathParts[1]) return pathParts[1];
            if (pathParts[0] === 'user' && pathParts[1]) return pathParts[1];
        } catch (e) { return null; }
        return null;
    };

    const handleFetch = async () => {
        const channelIdentifier = getChannelIdentifier(url);
        if (!channelIdentifier) {
            toast({ title: 'Invalid YouTube Channel URL', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setImageUrl(null);
        setChannelTitle(null);
        setError(null);
        
        try {
            const data = await getChannelDetails({ channelId: channelIdentifier });
            if (data.error) throw new Error(data.error);

            const targetUrl = itemToFetch === 'logo' ? data.logoUrl : data.bannerUrl;

            if (targetUrl && data.title) {
                setImageUrl(targetUrl);
                setChannelTitle(data.title);
            } else {
                 throw new Error(`Could not extract the channel ${itemToFetch}.`);
            }

        } catch (err: any) {
            setError(err.message);
            toast({ title: `Failed to Fetch ${itemToFetch}`, description: err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!imageUrl) return;
        window.open(imageUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="youtube-url" className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600"/>
                    YouTube Channel URL
                </Label>
                <div className="flex gap-2">
                    <Input 
                        id="youtube-url"
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        placeholder="https://www.youtube.com/@Google" 
                    />
                    <Button onClick={handleFetch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Fetch {itemToFetch === 'logo' ? 'Logo' : 'Banner'}
                    </Button>
                </div>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>}
            {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>{error}</AlertTitle></Alert>}
            
            {imageUrl && channelTitle && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>{channelTitle}'s {itemToFetch === 'logo' ? 'Logo' : 'Banner'}</CardTitle>
                        <CardDescription>Highest resolution available.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-full overflow-hidden rounded-md bg-muted" style={{ aspectRatio: itemToFetch === 'banner' ? '16/9' : '1/1' }}>
                            <Image src={imageUrl} alt={`${channelTitle} ${itemToFetch}`} layout="fill" objectFit={itemToFetch === 'banner' ? 'cover' : 'contain'} unoptimized/>
                        </div>
                        <Button onClick={handleDownload} className="w-full max-w-sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download {itemToFetch === 'logo' ? 'Logo' : 'Banner'}
                        </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
