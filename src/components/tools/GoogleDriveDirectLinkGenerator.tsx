
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, FileCheck, Copy, TestTube2, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function GoogleDriveDirectLinkGenerator() {
  const [shareableLink, setShareableLink] = useState('');
  const [directLink, setDirectLink] = useState('');
  const { toast } = useToast();

  const fileId = useMemo(() => {
    try {
      const url = new URL(shareableLink);
      if (url.hostname === 'drive.google.com') {
        const parts = url.pathname.split('/');
        const fileIdIndex = parts.indexOf('d');
        if (fileIdIndex !== -1 && parts[fileIdIndex + 1]) {
          return parts[fileIdIndex + 1];
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [shareableLink]);

  const handleGenerate = () => {
    if (!fileId) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Google Drive file sharing link.',
        variant: 'destructive',
      });
      return;
    }
    const newDirectLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    setDirectLink(newDirectLink);
    toast({
      title: 'Link Generated!',
      description: 'Your direct download link is ready.',
    });
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
          Open your file in Google Drive, click 'Share', and set access to 'Anyone with the link'. Then, copy the link and paste it below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Step 1: Input Your Link</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="share-link">Google Drive Shareable URL</Label>
                    <Input id="share-link" value={shareableLink} onChange={e => setShareableLink(e.target.value)} placeholder="https://drive.google.com/file/d/..."/>
                </div>
            </CardContent>
           </Card>
           
           <Card className={!fileId ? 'opacity-50' : ''}>
                <CardHeader>
                    <CardTitle>Step 2: Confirm File ID</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
                        <FileCheck className="h-5 w-5 text-primary"/>
                        <span className="font-mono truncate">{fileId || 'File ID will appear here'}</span>
                     </div>
                </CardContent>
           </Card>

           <Button onClick={handleGenerate} disabled={!fileId} className="w-full">
            <Wand2 className="mr-2 h-4 w-4"/> Generate Direct Link
           </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Step 3: Get Your Direct Link</CardTitle>
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
