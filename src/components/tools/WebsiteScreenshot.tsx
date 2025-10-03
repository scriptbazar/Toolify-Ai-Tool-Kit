
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Download, Loader2, Link as LinkIcon, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Device = 'desktop' | 'tablet' | 'mobile';

export function WebsiteScreenshot() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDevice, setActiveDevice] = useState<Device>('desktop');
  const [debouncedUrl] = useDebounce(url, 1000);
  const { toast } = useToast();

  const deviceConfig = {
    desktop: { width: 1920, icon: Monitor },
    tablet: { width: 768, icon: Tablet },
    mobile: { width: 414, icon: Smartphone },
  };

  const screenshotUrl = useMemo(() => {
    if (!debouncedUrl.trim()) return null;
    let fullUrl = debouncedUrl;
    if (!/^https?:\/\//i.test(debouncedUrl)) {
        fullUrl = `https://${debouncedUrl}`;
    }
    try {
      new URL(fullUrl);
      const width = deviceConfig[activeDevice].width;
      return `https://image.thum.io/get/width/${width}/crop/600/fullpage/noanimate/${fullUrl}`;
    } catch (e) {
      return null;
    }
  }, [debouncedUrl, activeDevice]);

  const handleDownload = async () => {
    if (!screenshotUrl) return;
    try {
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      link.download = `screenshot-${domain}-${activeDevice}.jpeg`;
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
        
        <Tabs value={activeDevice} onValueChange={(val) => setActiveDevice(val as Device)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4"/>Desktop</TabsTrigger>
                <TabsTrigger value="tablet"><Tablet className="mr-2 h-4 w-4"/>Tablet</TabsTrigger>
                <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4"/>Mobile</TabsTrigger>
            </TabsList>
        </Tabs>

        {(isLoading || screenshotUrl) && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Screenshot Preview
                    </CardTitle>
                    <CardDescription>
                        A full-page screenshot for the {activeDevice} view.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full max-w-4xl border rounded-lg bg-muted flex items-center justify-center overflow-hidden" style={{ aspectRatio: `${deviceConfig[activeDevice].width}/600` }}>
                        {screenshotUrl && (
                            <Image 
                                key={screenshotUrl} // Add key to force re-render on URL change
                                src={screenshotUrl}
                                alt={`Screenshot of ${url}`}
                                width={deviceConfig[activeDevice].width}
                                height={600}
                                className="w-full h-full object-contain"
                                onLoadingComplete={() => setIsLoading(false)}
                                onError={() => {
                                  setIsLoading(false);
                                  toast({ title: "Failed to load screenshot", description: "The URL might be invalid or the site could be blocking screenshots.", variant: "destructive" });
                                }}
                            />
                        )}
                        {isLoading && (
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
