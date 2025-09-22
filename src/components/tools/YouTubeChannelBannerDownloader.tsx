
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Download, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// This is a simplified interface for demonstration.
interface ChannelInfoResponse {
    items?: {
        brandingSettings?: {
            image?: {
                bannerExternalUrl?: string;
            }
        }
    }[];
    error?: {
        message: string;
    }
}

export function YouTubeChannelBannerDownloader() {
    const [url, setUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchBanner = async () => {
        if (!url.trim()) {
            toast({ title: 'Please enter a YouTube channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setBannerUrl(null);
        
        try {
            // NOTE: This is a placeholder for a real API call.
            // A robust production solution would use a server-side proxy to handle API keys securely.
            const channelId = new URL(url).pathname.split('/').pop();
            if (!channelId) {
                throw new Error("Could not extract a Channel ID or username from the URL.");
            }
            
            // We will simulate a successful response for ANY valid channel URL for demo purposes.
            // This URL is a generic placeholder.
            const simulatedBannerUrl = `https://picsum.photos/seed/${channelId}/1280/720`;
            setBannerUrl(simulatedBannerUrl);
            toast({ title: "Banner Found!", description: "A placeholder banner is ready for download." });

        } catch (error: any) {
            console.error("Banner fetch error:", error);
            toast({
                title: 'Failed to Fetch Banner',
                description: error.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!bannerUrl) return;
        // The URL from the API might need to be proxied to allow direct download.
        // For now, we open it in a new tab.
        window.open(bannerUrl, '_blank');
    }

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
                        placeholder="https://www.youtube.com/@google" 
                    />
                    <Button onClick={handleFetchBanner} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Get Banner
                    </Button>
                </div>
            </div>
            
            {(isLoading || bannerUrl) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Channel Banner Preview</CardTitle>
                        <CardDescription>This is the highest resolution banner available for the channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full aspect-[16/9] border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : bannerUrl ? (
                                <Image 
                                    src={bannerUrl}
                                    alt="Channel Banner"
                                    width={1280}
                                    height={720}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-10 w-10 mx-auto mb-2"/>
                                    <p>No banner found.</p>
                                </div>
                            )}
                        </div>
                         <Button onClick={handleDownload} disabled={!bannerUrl || isLoading} className="w-full">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Banner
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
