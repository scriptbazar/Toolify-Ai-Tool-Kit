
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Download, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { downloadVideo } from '@/ai/flows/video-downloader';

export function YouTubeChannelLogoDownloader() {
    const [url, setUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchLogo = async () => {
        if (!url.trim() || !URL.canParse(url)) {
            toast({ title: 'Please enter a valid YouTube channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setLogoUrl(null);
        
        try {
            const result = await downloadVideo({ url });
            if (result.status === 'error' || !result.audio) {
                // Cobalt API might return audio for the channel logo URL
                 throw new Error(result.text || 'Could not fetch channel information.');
            }

            // The Cobalt response for a channel URL contains the logo in the 'audio' field
            setLogoUrl(result.audio);
            toast({ title: "Logo Found!", description: "The channel logo is ready for download." });

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
                                    unoptimized
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
