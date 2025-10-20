
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube, Loader2, Search, Monitor, Tablet, Smartphone, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getChannelDetails } from '@/ai/flows/youtube-data';
import { Alert, AlertTitle } from '../ui/alert';

export function YouTubeChannelBannerDownloader() {
    const [url, setUrl] = useState('');
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        setChannelTitle(null);
        setError("Banner images are not available through this method. This feature is currently disabled.");
        setIsLoading(false);
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
             {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Feature Disabled</AlertTitle>
                    <div>{error} We are working on a new method to fetch banner images. Please check back later.</div>
                </Alert>
            )}
        </div>
    );
}
