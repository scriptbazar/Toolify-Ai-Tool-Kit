
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Download, Loader2, Link as LinkIcon, MonitorSmartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';

export function WebsiteScreenshot() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedUrl] = useDebounce(url, 1000); // Debounce input by 1 second
  const { toast } = useToast();

  const screenshotUrl = useMemo(() => {
    if (!debouncedUrl.trim()) return null;
    let fullUrl = debouncedUrl;
    if (!/^https?:\/\//i.test(debouncedUrl)) {
        fullUrl = `https://${debouncedUrl}`;
    }
    try {
      // Validate URL before creating the screenshot URL
      new URL(fullUrl);
      return `https://image.thum.io/get/width/1080/crop/1920/fullpage/noanimate/${fullUrl}`;
    } catch (e) {
      return null;
    }
  }, [debouncedUrl]);

  const handleDownload = async () => {
    if (!screenshotUrl) return;
    try {
      // Fetch the image as a blob to allow naming the file
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      link.download = `screenshot-${domain}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Download Failed",
        description: "Could not download the screenshot. You can try right-clicking the image and saving it.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="url-input" className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5"/>
                Website URL
            </Label>
            <Input 
                id="url-input" 
                value={url} 
                onChange={e => {
                  setUrl(e.target.value);
                  if(e.target.value.trim()){
                    setIsLoading(true);
                  } else {
                    setIsLoading(false);
                  }
                }}
                placeholder="https://example.com" 
            />
        </div>

        {(isLoading || screenshotUrl) && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MonitorSmartphone className="h-5 w-5" />
                        Screenshot Preview
                    </CardTitle>
                    <CardDescription>
                        A full-page screenshot of the provided URL.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full max-w-lg aspect-[9/16] border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {screenshotUrl && (
                            <Image 
                                src={screenshotUrl}
                                alt={`Screenshot of ${url}`}
                                width={375} // A common mobile width for preview
                                height={667} // Corresponding height for a 9:16 aspect ratio
                                className="w-full h-full object-contain"
                                onLoadingComplete={() => setIsLoading(false)}
                                onError={() => {
                                  setIsLoading(false);
                                  toast({ title: "Failed to load screenshot", description: "The URL might be invalid or the site could be blocking screenshots.", variant: "destructive" });
                                }}
                            />
                        )}
                        {isLoading && !screenshotUrl && (
                           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        )}
                    </div>
                     <Button onClick={handleDownload} disabled={!screenshotUrl || isLoading} className="w-full max-w-lg">
                        <Download className="mr-2 h-4 w-4"/>
                        Download Screenshot
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
