
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, FileCheck, Copy, TestTube2, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function DropboxDirectLinkGenerator() {
  const [shareableLink, setShareableLink] = useState('');
  const { toast } = useToast();

  const directLink = useMemo(() => {
    if (!shareableLink.trim()) return '';
    try {
      const url = new URL(shareableLink);
      if (url.hostname === 'www.dropbox.com' || url.hostname === 'dropbox.com') {
        url.hostname = 'dl.dropboxusercontent.com';
        url.searchParams.delete('dl');
        return url.toString();
      }
      return '';
    } catch (e) {
      return '';
    }
  }, [shareableLink]);


  const handleCopy = () => {
    if (!directLink) return;
    navigator.clipboard.writeText(directLink);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setShareableLink('');
  }

  return (
    <div className="space-y-6">
       <Alert>
        <LinkIcon className="h-4 w-4" />
        <AlertTitle>How to use this tool?</AlertTitle>
        <AlertDescription>
            In Dropbox, get a shareable link for your file. Make sure the link ends with `?dl=0`. Paste that link below and it will be instantly converted.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Step 1: Input Your Dropbox Link</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="share-link">Dropbox Shareable URL</Label>
                    <Input id="share-link" value={shareableLink} onChange={e => setShareableLink(e.target.value)} placeholder="https://www.dropbox.com/s/....?dl=0"/>
                </div>
            </CardContent>
           </Card>
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
                        <Trash2 className="mr-2 h-4 w-4"/> Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
