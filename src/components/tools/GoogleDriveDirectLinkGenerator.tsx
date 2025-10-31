
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link as LinkIcon, FileCheck, Copy, TestTube2, Trash2, Wand2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface LinkPair {
    id: number;
    original: string;
    direct: string;
    error?: string;
}

export function GoogleDriveDirectLinkGenerator() {
  const [links, setLinks] = useState([{ id: 1, value: '' }]);
  const [generatedLinks, setGeneratedLinks] = useState<LinkPair[]>([]);
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
    const validLinks = links.filter(l => l.value.trim() !== '');
    if (validLinks.length === 0) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter at least one Google Drive file sharing link.',
        variant: 'destructive',
      });
      return;
    }

    const newGeneratedLinks: LinkPair[] = validLinks.map((link, index) => {
        const fileId = getFileId(link.value);
        if (fileId) {
            return {
                id: link.id,
                original: link.value,
                direct: `https://drive.google.com/uc?export=download&id=${fileId}`
            };
        }
        return {
            id: link.id,
            original: link.value,
            direct: '',
            error: 'Invalid Link Format'
        };
    });
    
    setGeneratedLinks(newGeneratedLinks);
    toast({
      title: 'Links Generated!',
      description: `Processed ${newGeneratedLinks.length} URLs.`,
    });
  };
  
  const handleLinkChange = (id: number, value: string) => {
    setLinks(links.map(link => link.id === id ? { ...link, value } : link));
  };
  
  const addLinkInput = () => {
    setLinks([...links, { id: Date.now(), value: '' }]);
  };
  
  const removeLinkInput = (id: number) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ description: 'Link copied to clipboard!' });
  };
  
  const handleCopyAll = () => {
    const allLinks = generatedLinks.map(l => l.direct).filter(Boolean).join('\n');
    if (!allLinks) return;
    navigator.clipboard.writeText(allLinks);
    toast({ title: 'All valid links copied to clipboard!' });
  };
  
  const handleClear = () => {
    setLinks([{ id: 1, value: '' }]);
    setGeneratedLinks([]);
  }

  return (
    <div className="space-y-6">
       <Alert>
        <LinkIcon className="h-4 w-4" />
        <AlertTitle>How to use this tool?</AlertTitle>
        <AlertDescription>
          In Google Drive, get a shareable link for your file (set to 'Anyone with the link can view'). Paste one or more links below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Input Your Google Drive Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {links.map((link, index) => (
                    <div key={link.id} className="flex items-end gap-2">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor={`share-link-${index}`}>Google Drive URL #{index + 1}</Label>
                            <Input 
                                id={`share-link-${index}`} 
                                value={link.value} 
                                onChange={e => handleLinkChange(link.id, e.target.value)} 
                                placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                            />
                        </div>
                        {links.length > 1 && (
                            <Button variant="destructive" size="icon" onClick={() => removeLinkInput(link.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                ))}
                <Button variant="outline" onClick={addLinkInput} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add URL
                </Button>
            </CardContent>
           </Card>

           <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleGenerate} className="w-full">
                  <Wand2 className="mr-2 h-4 w-4"/> Generate Direct Links
              </Button>
               <Button onClick={handleClear} variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4"/> Clear All
              </Button>
           </div>
        </div>
        
        {generatedLinks.length > 0 && (
           <Card>
            <CardHeader>
                <CardTitle>Your Direct Links</CardTitle>
                <CardDescription>Use these links for direct downloads. Invalid links will show an error.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {generatedLinks.map((link, index) => (
                        <div key={index} className="p-2 border rounded-md bg-muted">
                           <p className="text-xs text-muted-foreground truncate mb-1">Original: {link.original}</p>
                           <div className="flex items-center gap-2">
                           <div className="flex-1 overflow-hidden">
                             {link.error ? (
                                <p className="text-sm font-mono text-red-500 truncate" title={link.error}>{link.error}</p>
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
    </div>
  );
}
