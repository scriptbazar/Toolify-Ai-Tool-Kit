
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getChannelDetails } from '@/ai/flows/youtube-data';
import { Alert, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';


export function YouTubeChannelLogoDownloader() {
    const [url, setUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [channelTitle, setChannelTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const getChannelIdOrUsername = (inputUrl: string): string | null => {
        if (!inputUrl) return null;
        try {
            const urlObj = new URL(inputUrl);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            if (pathParts[0] === 'channel' && pathParts[1]) {
                return pathParts[1]; // Returns UC... ID
            }
            if (pathParts[0]?.startsWith('@')) {
                return pathParts[0]; // Returns @handle
            }
             if (pathParts[0] === 'c' && pathParts[1]) {
                return `@${pathParts[1]}`; // Convert /c/ to @handle
            }
             if (pathParts[0] === 'user' && pathParts[1]) {
                return `@${pathParts[1]}`; // Convert /user/ to @handle
            }

        } catch (e) { return null; }
        return null;
    }

    const handleFetchLogo = async () => {
        const channelIdentifier = getChannelIdOrUsername(url);
        if (!channelIdentifier) {
            toast({ title: 'Invalid YouTube Channel URL', description: 'Please enter a valid channel URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setLogoUrl(null);
        setChannelTitle(null);
        setError(null);
        
        try {
            const data = await getChannelDetails({ channelId: channelIdentifier });
            if (data.error) throw new Error(data.error);

            if (data.logoUrl && data.title) {
                setLogoUrl(data.logoUrl);
                setChannelTitle(data.title);
            } else {
                 throw new Error('Could not extract logo from this URL.');
            }

        } catch (error: any) {
            console.error("Fetch error:", error);
            setError(error.message || 'An unknown error occurred.');
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
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border">
                            <Image src={logoUrl} alt={`${channelTitle} Logo`} layout="fill" objectFit="cover" unoptimized/>
                        </div>
                        <Button onClick={handleDownload} className="w-full max-w-sm">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Logo (High Quality)
                        </Button>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
