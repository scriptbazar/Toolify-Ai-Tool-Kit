
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Instagram, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    
    // Client-side fetching is blocked by CORS. The reliable solution is to
    // redirect the user to a third-party service that can handle the download.
    try {
        const downloaderServiceUrl = `https://savefrom.net/`;
        
        toast({
            title: "Redirecting to Downloader",
            description: "We'll open a new tab for you to complete the download.",
        });

        // Open the service in a new tab. The user will then paste the URL there.
        window.open(downloaderServiceUrl, '_blank');

    } catch (error: any) {
      console.error("Download Error:", error);
      toast({ title: 'Redirection Failed', description: "Could not open the download service. Please try again.", variant: 'destructive' });
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
