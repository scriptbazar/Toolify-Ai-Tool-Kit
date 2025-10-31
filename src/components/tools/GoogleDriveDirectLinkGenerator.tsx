
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, FileCheck, Copy, TestTube2, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Textarea } from '../ui/textarea';

interface GeneratedLink {
    original: string;
    direct: string;
    error?: string;
}

export function GoogleDriveDirectLinkGenerator() {
  const [shareableLinks, setShareableLinks] = useState('');
  const [directLinks, setDirectLinks] = useState<GeneratedLink[]>([]);
  const { toast } = useToast();
  
  const getFileId = (link: string): string | null => {
    try {
        const url = new URL(link);
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
  }

  const handleGenerate = () => {
    if (!shareableLinks.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter at least one Google Drive file sharing link.',
        variant: 'destructive',
      });
      return;
    }

    const urls = shareableLinks.split('\n').filter(link => link.trim() !== '');
    const generated: GeneratedLink[] = urls.map(original => {
        const fileId = getFileId(original);
        if (fileId) {
            return {
                original,
                direct: `https://drive.google.com/uc?export=download&id=${fileId}`
            };
        }
        return {
            original,
            direct: '',
            error: 'Invalid Link Format'
        };
    });
    
    setDirectLinks(generated);
    toast({
      title: 'Links Generated!',
      description: `Processed ${generated.length} URLs.`,
    });
  };
  
  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ description: 'Link copied to clipboard!' });
  };
  
   const handleCopyAll = () => {
    const allLinks = directLinks.map(l => l.direct).filter(Boolean).join('\n');
    if (!allLinks) return;
    navigator.clipboard.writeText(allLinks);
    toast({ title: 'All links copied to clipboard!' });
  };
  
  const handleClear = () => {
    setShareableLinks('');
    setDirectLinks([]);
  }

  return (
    <div className="space-y-6">
       <Alert>
        <LinkIcon className="h-4 w-4" />
        <AlertTitle>How to use this tool?</AlertTitle>
        <AlertDescription>
          In Google Drive, get a shareable link for your file (set to 'Anyone with the link can view'). Paste one or more links below (one per line).
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Step 1: Input Your Google Drive Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="share-links">Google Drive Shareable URLs (one per line)</Label>
                    <Textarea id="share-links" value={shareableLinks} onChange={e => setShareableLinks(e.target.value)} placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing" className="min-h-[150px]"/>
                </div>
            </CardContent>
           </Card>
      </div>

       <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleGenerate} className="w-full">
              <Wand2 className="mr-2 h-4 w-4"/> Generate Direct Links
          </Button>
           <Button onClick={handleClear} variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4"/> Clear All
          </Button>
       </div>
       
       {directLinks.length > 0 && (
           <Card>
            <CardHeader>
                <CardTitle>Step 2: Get Your Direct Links</CardTitle>
                <CardDescription>Use these links for direct downloads. Invalid links will show an error.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {directLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                           <div className="flex-1 overflow-hidden">
                             {link.error ? (
                                <>
                                 <p className="text-sm font-mono text-red-500 truncate" title={link.original}>{link.error}</p>
                                 <p className="text-xs text-muted-foreground truncate">{link.original}</p>
                                </>
                             ) : (
                                <a href={link.direct} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline truncate block" title={link.direct}>
                                    {link.direct}
                                </a>
                             )}
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => handleCopy(link.direct)} disabled={!!link.error}>
                               <Copy className="h-4 w-4"/>
                           </Button>
                        </div>
                    ))}
                </div>
                 <Button onClick={handleCopyAll} variant="outline" className="w-full">
                    <Copy className="mr-2 h-4 w-4"/> Copy All Valid Links
                </Button>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
