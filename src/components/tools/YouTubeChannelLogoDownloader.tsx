
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface OEmbedResponse {
    thumbnail_url?: string;
    title?: string;
    error?: string;
}

export function YouTubeChannelLogoDownloader() {
    const [url, setUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchLogo = async () => {
        if (!url.trim()) {
            toast({ title: 'Please enter a YouTube channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setLogoUrl(null);
        setChannelTitle(null);

        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
             if (!response.ok) {
                 throw new Error(`Could not fetch channel data. Status: ${response.status}`);
            }
            const data: OEmbedResponse = await response.json();

            if (data.thumbnail_url && data.title) {
                // The oEmbed thumbnail is usually low-res. We can often get a higher-res version by modifying the URL.
                const highResUrl = data.thumbnail_url.replace(/s\d+-c-k-c0x00ffffff-no-rj/, 's512-c-k-c0x00ffffff-no-rj');
                setLogoUrl(highResUrl);
                setChannelTitle(data.title);
            } else {
                throw new Error(data.error || 'Could not extract logo from this URL.');
            }
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast({
                title: 'Failed to Fetch Logo',
                description: error.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = async () => {
        if (!logoUrl) return;
        try {
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `logo-${channelTitle?.replace(/\s/g, '_') || 'youtube'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            toast({ title: "Download Failed", description: "Could not download the logo.", variant: "destructive" });
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
                        placeholder="https://www.youtube.com/@Google" 
                    />
                    <Button onClick={handleFetchLogo} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Fetch Logo
                    </Button>
                </div>
            </div>

            {(isLoading || logoUrl) && (
                 <Card>
                    <CardHeader>
                        <CardTitle>{channelTitle ? `${channelTitle}'s Logo` : 'Channel Logo'}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48 w-48">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : logoUrl ? (
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border">
                                <Image src={logoUrl} alt={`${channelTitle} Logo`} layout="fill" objectFit="cover" />
                            </div>
                        ) : null}
                        <Button onClick={handleDownload} disabled={!logoUrl || isLoading} className="w-full max-w-sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Logo (High Quality)
                        </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
