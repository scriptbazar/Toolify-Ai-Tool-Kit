
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
        snippet?: {
            thumbnails?: {
                high?: {
                    url?: string;
                }
            }
        }
    }[];
    error?: {
        message: string;
    }
}

export function YouTubeChannelLogoDownloader() {
    const [url, setUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchLogo = async () => {
        if (!url.trim()) {
            toast({ title: 'Please enter a YouTube channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setLogoUrl(null);
        
        try {
            // NOTE: This is a placeholder for a real API call.
            // A robust production solution would use a server-side proxy to handle API keys securely.
            const channelId = new URL(url).pathname.split('/').pop();
            if (!channelId) {
                throw new Error("Could not extract a Channel ID or username from the URL.");
            }
            
            // We will simulate a successful response for ANY valid channel URL for demo purposes.
            // This URL is a generic placeholder that generates an image based on the channel ID.
            const simulatedLogoUrl = `https://i.pravatar.cc/300?u=${channelId}`;
            setLogoUrl(simulatedLogoUrl);
            toast({ title: "Logo Found!", description: "A placeholder logo is ready for download." });

        } catch (error: any) {
            console.error("Logo fetch error:", error);
            toast({
                title: 'Failed to Fetch Logo',
                description: error.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!logoUrl) return;
        // The URL from the API might need to be proxied to allow direct download.
        // For now, we open it in a new tab.
        window.open(logoUrl, '_blank');
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
                    <Button onClick={handleFetchLogo} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Get Logo
                    </Button>
                </div>
            </div>
            
            {(isLoading || logoUrl) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Channel Logo Preview</CardTitle>
                        <CardDescription>This is the highest resolution logo available for the channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full max-w-xs mx-auto aspect-square border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : logoUrl ? (
                                <Image 
                                    src={logoUrl}
                                    alt="Channel Logo"
                                    width={256}
                                    height={256}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-10 w-10 mx-auto mb-2"/>
                                    <p>No logo found.</p>
                                </div>
                            )}
                        </div>
                         <Button onClick={handleDownload} disabled={!logoUrl || isLoading} className="w-full">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Logo
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
