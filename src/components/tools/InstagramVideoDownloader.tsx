'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Instagram, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveUserMedia } from '@/ai/flows/media-management';

export function InstagramVideoDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!url.trim() || !URL.canParse(url)) {
      toast({ title: 'Please enter a valid Instagram URL.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // WARNING: This is a client-side approach using a public proxy/API.
      // It is not guaranteed to work and may break if the third-party service changes or if Instagram blocks it.
      // A robust solution requires a dedicated server-side component.
      
      // Using an Invidious instance as a proxy to fetch the video. This is primarily for YouTube, but can sometimes work for other services.
      // This is a best-effort attempt and is likely to fail.
      const proxyUrl = `https://invidious.io.lol/`;
      const videoId = new URL(url).pathname.split('/').filter(Boolean).pop();
      const response = await fetch(`${proxyUrl}api/v1/videos/${videoId}`);
      
      if (!response.ok) {
           throw new Error('Could not fetch video information. The video might be private or the service is unavailable.');
      }
      
      const data = await response.json();
      const videoUrl = data.formatStreams?.find((f: any) => f.qualityLabel === '720p')?.url || data.formatStreams?.[0]?.url;

      if (!videoUrl) {
          throw new Error('No downloadable video stream found.');
      }

      toast({ title: 'Downloading...', description: 'Your video will begin downloading shortly.' });
      
      // Since we can't directly download from the proxied URL due to CORS, we open it in a new tab.
      // The user can then right-click to save. This is a limitation of client-side approaches.
      window.open(videoUrl, '_blank');

    } catch (error: any) {
      console.error("Download Error:", error);
      toast({ title: 'Download Failed', description: error.message || 'This video could not be downloaded. It might be private or protected.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="instagram-url" className="flex items-center gap-2">
                <Instagram className="h-5 w-5"/>
                Instagram Video/Reel URL
            </Label>
            <Input 
                id="instagram-url"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://www.instagram.com/p/..." 
            />
        </div>
        <Button onClick={handleDownload} disabled={isLoading || !url} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Download Video'}
        </Button>
    </div>
  );
}
