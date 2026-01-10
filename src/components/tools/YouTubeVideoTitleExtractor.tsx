

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Copy, Trash2, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getVideoId } from '@/lib/youtube-utils';

interface OEmbedResponse {
    title?: string;
    error?: string;
}

export function YouTubeVideoTitleExtractor() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleExtract = async () => {
        if (!url.trim()) {
            toast({ title: 'Please enter a YouTube video URL.', variant: 'destructive' });
            return;
        }
        
        const videoId = getVideoId(url);
        if (!videoId) {
            toast({ title: 'Invalid YouTube URL', description: 'Could not extract Video ID from the URL.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setTitle(null);
        
        try {
            // Use the public oEmbed endpoint which doesn't require an API key
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            
            if (!response.ok) {
                 throw new Error(`Could not fetch video data. Status: ${response.status}`);
            }

            const data: OEmbedResponse = await response.json();
            
            if (data.title) {
                setTitle(data.title);
            } else {
                throw new Error(data.error || 'Could not extract title from this URL.');
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
        if (!title) return;
        navigator.clipboard.writeText(title);
        toast({ title: 'Title copied to clipboard!' });
    };

    const handleClear = () => {
        setUrl('');
        setTitle(null);
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
                        Extract Title
                    </Button>
                </div>
            </div>
            
            {(isLoading || title) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Video Title</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="h-10 bg-muted animate-pulse rounded-md" />
                        ) : (
                            <p className="p-4 bg-muted rounded-md font-semibold text-lg">{title}</p>
                        )}
                         <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCopy} disabled={!title}>
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
