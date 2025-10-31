'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, RefreshCw, Copy, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GoogleDriveDirectLinkGenerator() {
  const [shareableLink, setShareableLink] = useState('');
  const [directLink, setDirectLink] = useState('');
  const { toast } = useToast();

  const fileId = useMemo(() => {
    if (!shareableLink.trim()) return null;
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
    <div className="max-w-2xl mx-auto space-y-6 text-center">
        <h2 className="text-xl text-muted-foreground">Convert Google Drive file links into direct download links!</h2>
        
        <div className="space-y-4">
            <Label htmlFor="share-link" className="text-lg font-semibold">Enter Google Drive File URL:</Label>
            <Input 
                id="share-link" 
                value={shareableLink} 
                onChange={e => setShareableLink(e.target.value)} 
                placeholder="Paste your shareable link (Must have 'Anyone with the link can view' access) here"
                className="h-14 text-center"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button onClick={handleGenerate} disabled={!fileId} size="lg">
                <RefreshCw className="mr-2 h-4 w-4"/> Generate Link
            </Button>
            <Button onClick={handleCopy} disabled={!directLink} variant="secondary" size="lg">
                <Copy className="mr-2 h-4 w-4"/> Copy Link
            </Button>
            <Button onClick={handleClear} variant="destructive" size="lg">
                <Trash2 className="mr-2 h-4 w-4"/> Reset
            </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg text-center font-mono truncate">
            {directLink || "Enter a Google Drive shareable link to get a direct download link."}
        </div>
    </div>
  );
}
