
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, BookImage, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadVideo } from '@/ai/flows/video-downloader';

export function PinterestVideoDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!url.trim() || !URL.canParse(url)) {
      toast({ title: 'Please enter a valid Pinterest URL.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await downloadVideo({ url, platform: 'pinterest' });
      if (result.success && result.downloadUrl) {
        toast({ title: 'Download Ready!', description: result.message });
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.setAttribute('download', result.title || 'pinterest-video.mp4');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: 'Download Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="pinterest-url" className="flex items-center gap-2">
                <BookImage className="h-5 w-5"/>
                Pinterest Video URL
            </Label>
            <Input 
                id="pinterest-url"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://www.pinterest.com/pin/..." 
            />
        </div>
        <Button onClick={handleDownload} disabled={isLoading || !url} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Download Video'}
        </Button>
    </div>
  );
}
