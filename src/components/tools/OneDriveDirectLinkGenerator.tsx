
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, FileCheck, Copy, TestTube2, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function OneDriveDirectLinkGenerator() {
  const [shareableLink, setShareableLink] = useState('');
  const [directLink, setDirectLink] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!shareableLink.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid OneDrive file sharing link.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
        const newDirectLink = shareableLink.replace("/embed?", "/download?");
        
        if (newDirectLink === shareableLink) {
            throw new Error("Could not convert the link. Please ensure you are using the 'Embed' link from OneDrive's share options.");
        }

        setDirectLink(newDirectLink);
        toast({
          title: 'Link Generated!',
          description: 'Your direct download link is ready.',
        });

    } catch (error: any) {
        setDirectLink('');
        toast({
            title: 'Conversion Failed',
            description: error.message || 'Please use the "Embed" link from OneDrive.',
            variant: 'destructive',
        });
    }
  };
  
  const handleCopy = () => {
    if (!directLink) return;
    navigator.clipboard.writeText(directLink);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setShareableLink('');
    setDirectLink('');
  }

  return (
    <div className="space-y-6">
       <Alert>
        <LinkIcon className="h-4 w-4" />
        <AlertTitle>How to use this tool?</AlertTitle>
        <AlertDescription>
          Open your file in OneDrive, click 'Share', then select 'Embed'. Copy the `src` URL from the iframe code and paste it below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Step 1: Input Your Embed Link</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="share-link">OneDrive Embed URL</Label>
                    <Input id="share-link" value={shareableLink} onChange={e => setShareableLink(e.target.value)} placeholder="https://onedrive.live.com/embed?cid=..."/>
                </div>
            </CardContent>
           </Card>

           <Button onClick={handleGenerate} disabled={!shareableLink} className="w-full">
            <Wand2 className="mr-2 h-4 w-4"/> Generate Direct Link
           </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Get Your Direct Link</CardTitle>
                <CardDescription>Use this link for direct downloads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="direct-link">Generated Direct Download Link</Label>
                    <Input id="direct-link" value={directLink} readOnly className="font-mono bg-muted"/>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleCopy} disabled={!directLink} className="w-full">
                        <Copy className="mr-2 h-4 w-4"/> Copy Link
                    </Button>
                     <Button asChild variant="outline" disabled={!directLink} className="w-full">
                        <a href={directLink} target="_blank" rel="noopener noreferrer">
                           <TestTube2 className="mr-2 h-4 w-4"/> Test Link
                        </a>
                    </Button>
                </div>
                <div className="pt-4 border-t">
                    <Button onClick={handleClear} variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4"/> Clear All
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
