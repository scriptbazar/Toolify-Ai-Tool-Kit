'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

interface OEmbedResponse {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
    error?: string;
}

export function YouTubeChannelLogoDownloader() {
    const [url, setUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const getVideoId = (inputUrl: string): string | null => {
        if (!inputUrl) return null;
        try {
            const urlObj = new URL(inputUrl);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname.includes('youtube.com')) {
                const videoIdParam = urlObj.searchParams.get('v');
                if (videoIdParam) return videoIdParam;
            }
        } catch (e) { return null; }
        return null;
    }

    const handleFetchLogo = async () => {
        const videoId = getVideoId(url);
        if (!videoId) {
            toast({ title: 'Invalid YouTube Video URL', description: 'Please enter a valid video URL, not a channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setLogoUrl(null);
        setChannelTitle(null);
        setError(null);
        
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`);
            
            if (!response.ok) {
                 throw new Error(`Could not fetch video data. Status: ${response.status}`);
            }

            const data: OEmbedResponse = await response.json();
            
            if (data.author_name && data.author_url) {
                // The oEmbed for a video doesn't provide a direct channel logo.
                // We will use the video's high-quality thumbnail as a proxy for the logo.
                setLogoUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
                setChannelTitle(data.author_name);
            } else {
                 throw new Error('Could not extract channel information from this video URL.');
            }

        } catch (error: any) {
            console.error("Fetch error:", error);
            setError(error.message || 'An unknown error occurred.');
            toast({
                title: 'Failed to Fetch Info',
                description: error.message || 'Please check the video URL and try again.',
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
                    YouTube Video URL
                </Label>
                <div className="flex gap-2">
                    <Input 
                        id="youtube-url"
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                    />
                    <Button onClick={handleFetchLogo} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Fetch Logo
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
             {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Fetching Logo</AlertTitle>
                    <div>{error}</div>
                </Alert>
            )}
            {logoUrl && channelTitle && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>{channelTitle}'s Logo</CardTitle>
                        <CardDescription>This is the highest quality logo we could extract for this channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border">
                            <Image src={logoUrl} alt={`${channelTitle} Logo`} layout="fill" objectFit="cover" unoptimized/>
                        </div>
                        <Button onClick={handleDownload} className="w-full max-w-sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Logo
                        </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
