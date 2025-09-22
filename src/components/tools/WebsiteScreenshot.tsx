
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Download, Loader2, Link as LinkIcon, MonitorSmartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

interface PagespeedApiResponse {
  lighthouseResult?: {
    audits?: {
      'final-screenshot'?: {
        details?: {
          data: string;
        };
      };
    };
  };
  error?: {
    message: string;
  };
}


export function WebsiteScreenshot() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleTakeScreenshot = async () => {
    if (!url.trim()) {
      toast({ title: "URL is required", description: "Please enter a website URL.", variant: "destructive" });
      return;
    }
    
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
        fullUrl = `https://${url}`;
    }

    setIsLoading(true);
    setScreenshotData(null);
    
    try {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&screenshot=true`;
        const response = await fetch(apiUrl);
        const data: PagespeedApiResponse = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }
        
        const screenshot = data.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
        
        if (screenshot) {
            // The data is base64 but with URL-safe characters. Replace them back.
            const formattedScreenshot = screenshot.replace(/_/g, '/').replace(/-/g, '+');
            setScreenshotData(formattedScreenshot);
        } else {
            throw new Error("Could not capture a screenshot for this URL. It might be inaccessible.");
        }
        
    } catch (error: any) {
        console.error("Screenshot error:", error);
        if (typeof error.message === 'string' && error.message.includes('Quota exceeded')) {
             toast({ title: 'Daily Limit Reached', description: 'The screenshot service has reached its daily usage limit. Please try again tomorrow.', variant: 'destructive'});
        } else {
            toast({ title: 'Error', description: error.message || 'An unknown error occurred.', variant: 'destructive'});
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!screenshotData) return;
    const link = document.createElement('a');
    link.href = screenshotData;
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    link.download = `screenshot-${domain}.jpeg`; // PageSpeed API returns JPEG
    link.click();
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="url-input" className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5"/>
                Website URL
            </Label>
            <div className="flex gap-2">
                <Input 
                    id="url-input" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    placeholder="https://example.com" 
                />
                <Button onClick={handleTakeScreenshot} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Camera className="mr-2 h-4 w-4" />}
                    Take Screenshot
                </Button>
            </div>
        </div>

        {(isLoading || screenshotData) && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MonitorSmartphone className="h-5 w-5" />
                        Screenshot Preview
                    </CardTitle>
                    <CardDescription>
                        This is a full-page screenshot of the provided URL.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full max-w-lg aspect-[9/16] border rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {isLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : screenshotData && (
                            <Image 
                                src={screenshotData}
                                alt={`Screenshot of ${url}`}
                                width={375} // A common mobile width for preview
                                height={667} // Corresponding height for a 9:16 aspect ratio
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>
                     <Button onClick={handleDownload} disabled={!screenshotData} className="w-full max-w-lg">
                        <Download className="mr-2 h-4 w-4"/>
                        Download Screenshot
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
