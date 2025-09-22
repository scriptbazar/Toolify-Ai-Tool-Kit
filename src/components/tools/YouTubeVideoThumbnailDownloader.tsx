
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Download, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const thumbnailQualities = [
    { name: 'Max Resolution', res: 'maxresdefault.jpg', size: '1280x720' },
    { name: 'Standard Definition', res: 'sddefault.jpg', size: '640x480' },
    { name: 'High Quality', res: 'hqdefault.jpg', size: '480x360' },
    { name: 'Player Background', res: '0.jpg', size: '480x360' },
    { name: 'Medium Quality', res: 'mqdefault.jpg', size: '320x180' },
    { name: 'Default', res: 'default.jpg', size: '120x90' },
];

export function YouTubeVideoThumbnailDownloader() {
    const [url, setUrl] = useState('');
    const { toast } = useToast();

    const videoId = useMemo(() => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname.includes('youtube.com')) {
                const videoIdParam = urlObj.searchParams.get('v');
                if (videoIdParam) return videoIdParam;
            }
        } catch (e) {
            return null; // Invalid URL
        }
        return null;
    }, [url]);

    const handleDownload = async (thumbnailUrl: string, quality: string) => {
        try {
            // Fetching the image as a blob to bypass potential CORS issues and allow naming the file.
            const response = await fetch(thumbnailUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `thumbnail-${videoId}-${quality}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download failed", error);
            toast({
                title: "Download Failed",
                description: "Could not download the thumbnail. You can try right-clicking the image and saving it.",
                variant: "destructive",
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="youtube-url" className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600"/>
                    YouTube Video URL
                </Label>
                <Input 
                    id="youtube-url"
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                />
            </div>
            {videoId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbnailQualities.map(thumb => (
                        <Card key={thumb.res}>
                            <CardHeader>
                                <CardTitle className="text-lg">{thumb.name}</CardTitle>
                                <CardDescription>{thumb.size}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-video w-full relative overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={`https://i.ytimg.com/vi/${videoId}/${thumb.res}`}
                                        alt={`${thumb.name} thumbnail`}
                                        layout="fill"
                                        objectFit="cover"
                                        unoptimized // Important for external images that might not exist
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                                <Button className="w-full" onClick={() => handleDownload(`https://i.ytimg.com/vi/${videoId}/${thumb.res}`, thumb.res.split('.')[0])}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
