
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, Youtube, Loader2, Search, Monitor, Tablet, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getChannelDetails } from '@/ai/flows/youtube-data';

const bannerResolutions = [
    { name: 'Desktop Banner', res: 'desktop', size: '2120x351', query: '=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj' },
    { name: 'Tablet Banner', res: 'tablet', size: '1707x283', query: '=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj' },
    { name: 'Mobile Banner', res: 'mobile', size: '1060x175', query: '=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj' },
];

export function YouTubeChannelBannerDownloader() {
    const [url, setUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const getChannelId = (inputUrl: string): string | null => {
        if (!inputUrl) return null;
        try {
            const urlObj = new URL(inputUrl);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            if (pathParts[0] === 'channel' && pathParts[1]) {
                return pathParts[1];
            }
            if (pathParts[0]?.startsWith('@') || pathParts[0] === 'c' || pathParts[0] === 'user') {
                return pathParts[0];
            }
        } catch (e) { return null; }
        return null;
    }

    const handleFetchBanner = async () => {
        const channelId = getChannelId(url);
        if (!channelId) {
            toast({ title: 'Invalid YouTube Channel URL', description: 'Please enter a valid channel URL (e.g., https://www.youtube.com/@google).', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setBannerUrl(null);
        setChannelTitle(null);

        try {
            const data = await getChannelDetails({ channelId });
            if (data.error) {
                throw new Error(data.error);
            }
            if (data.bannerUrl) {
                setBannerUrl(data.bannerUrl);
                setChannelTitle(data.title || 'Channel');
            } else {
                 throw new Error("This channel does not seem to have a banner image.");
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast({
                title: 'Failed to Fetch Banner',
                description: error.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async (resolutionQuery: string, size: string) => {
        if (!bannerUrl) return;
        const downloadUrl = `${bannerUrl}${resolutionQuery}`;
        try {
            // Fetching as blob to allow naming the file.
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `banner-${channelTitle?.replace(/\s/g, '_') || 'youtube'}-${size}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast({ title: "Download Failed", description: "Could not download the banner.", variant: "destructive" });
        }
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
                        placeholder="https://www.youtube.com/c/YourChannel" 
                    />
                    <Button onClick={handleFetchBanner} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Fetch Banner
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            {bannerUrl && (
                 <div className="grid grid-cols-1 gap-6 animate-in fade-in-50">
                    {bannerResolutions.map(res => {
                        const fullUrl = `${bannerUrl}${res.query}`;
                        const Icon = res.res === 'desktop' ? Monitor : res.res === 'tablet' ? Tablet : Smartphone;
                        return (
                        <Card key={res.res}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Icon className="h-5 w-5"/>{res.name}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{res.size}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-video w-full relative overflow-hidden rounded-md bg-muted">
                                    <Image src={fullUrl} alt={`${res.name} banner`} layout="fill" objectFit="cover" />
                                </div>
                                <Button className="w-full" onClick={() => handleDownload(res.query, res.size)}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                                </Button>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            )}
        </div>
    );
}
