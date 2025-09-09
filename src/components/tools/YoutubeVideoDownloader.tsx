
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Youtube, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function YoutubeVideoDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!url.trim()) {
      toast({ title: 'Please enter a valid YouTube URL.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    // Dummy function - a real implementation would call a backend service here.
    setTimeout(() => {
      toast({ title: 'Download Started (Simulated)', description: 'In a real app, the video would start downloading now.' });
      setIsLoading(false);
    }, 2000);
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
