'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Youtube, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveUserMedia } from '@/ai/flows/media-management';

export function YoutubeVideoDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!url.trim() || !URL.canParse(url)) {
      toast({ title: 'Please enter a valid YouTube URL.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // The downloadVideo flow was complex and has been removed.
      // We will simulate a failure message as the backend logic is no longer present.
      throw new Error("Video download functionality is currently unavailable for YouTube.");
      
    } catch (error: any) {
      toast({ title: 'Download Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
        <Button onClick={handleDownload} disabled={isLoading || !url} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Download Video'}
        </Button>
    </div>
  );
}
