
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Copy, Trash2, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface OEmbedResponse {
    title?: string;
    html?: string;
    error?: string;
}

export function YouTubeVideoDescriptionExtractor() {
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // A simple client-side approach using a public oEmbed endpoint.
    // Note: This doesn't directly provide the description text.
    // A proper implementation would use a server-side proxy or the YouTube Data API.
    // For this demonstration, we'll simulate extracting from a mock description.
    const handleExtract = async () => {
        if (!url.trim()) {
            toast({ title: 'Please enter a YouTube URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setDescription(null);
        setVideoTitle(null);
        try {
            // Using a public oEmbed endpoint to get video title.
            const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const response = await fetch(oEmbedUrl);

            if (!response.ok) {
                 throw new Error(`Could not fetch video data. Status: ${response.status}`);
            }

            const data: OEmbedResponse = await response.json();

            if (data.title) {
                setVideoTitle(data.title);
                // SIMULATED DESCRIPTION
                const simulatedDescription = `This is a simulated description for the video titled "${data.title}".\n\nIn a real-world application, this would be fetched using the YouTube Data API on the server to avoid client-side limitations.\n\nKey features often found in descriptions:\n- Links to social media.\n- Affiliate links.\n- Timestamps for video chapters.\n- Hashtags like #YouTube #API #Demo.`;
                setDescription(simulatedDescription);

            } else {
                throw new Error(data.error || 'Could not extract data from this URL.');
            }
        } catch (error: any) {
            console.error("Extraction error:", error);
            toast({
                title: 'Extraction Failed',
                description: error.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!description) return;
        navigator.clipboard.writeText(description);
        toast({ title: 'Description copied to clipboard!' });
    };

    const handleClear = () => {
        setUrl('');
        setDescription(null);
        setVideoTitle(null);
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
                    <Button onClick={handleExtract} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4" />}
                        Extract Description
                    </Button>
                </div>
            </div>
            
            {(isLoading || description) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{videoTitle || 'Video Description'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                                <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                            </div>
                        ) : (
                            <Textarea value={description || ''} readOnly className="min-h-[200px] bg-muted"/>
                        )}
                         <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCopy} disabled={!description}>
                                <Copy className="mr-2 h-4 w-4"/> Copy
                            </Button>
                            <Button variant="destructive" onClick={handleClear}>
                                <Trash2 className="mr-2 h-4 w-4"/> Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
