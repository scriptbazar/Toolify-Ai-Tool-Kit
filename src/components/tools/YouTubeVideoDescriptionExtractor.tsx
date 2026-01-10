

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Copy, Trash2, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { getVideoDetails } from '@/ai/flows/youtube-data';
import { getVideoId } from '@/lib/youtube-utils';

export function YouTubeVideoDescriptionExtractor() {
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleExtract = async () => {
        const videoId = getVideoId(url);
        if (!videoId) {
            toast({ title: 'Invalid YouTube URL', description: 'Please enter a valid YouTube video URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setDescription(null);
        setVideoTitle(null);
        
        try {
            const data = await getVideoDetails({ videoId });
            if (data.error) {
                throw new Error(data.error);
            }
            setVideoTitle(data.title || 'Unknown Title');
            setDescription(data.description || 'No description found.');
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
                                <div className="h-20 w-full bg-muted animate-pulse rounded-md" />
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
