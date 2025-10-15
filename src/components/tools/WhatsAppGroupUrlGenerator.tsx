
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Copy, Trash2, Link as LinkIcon, Wand2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppGroupUrlGenerator() {
  const [groupLink, setGroupLink] = useState('');
  const [linkText, setLinkText] = useState('Join our WhatsApp Group');
  const [htmlLink, setHtmlLink] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!groupLink) {
        toast({ title: 'Group link is required', variant: 'destructive'});
        return;
    }
    
    // Basic validation for WhatsApp group link
    if (!groupLink.startsWith('https://chat.whatsapp.com/')) {
         toast({ title: 'Invalid Link', description: 'Please enter a valid WhatsApp group invitation link.', variant: 'destructive'});
        return;
    }

    const generatedHtml = `<a href="${groupLink}" target="_blank" rel="noopener noreferrer">${linkText || 'Join Group'}</a>`;
    setHtmlLink(generatedHtml);
    toast({ title: 'HTML Link Generated!'});
  };

  const handleCopy = () => {
    if (!htmlLink) return;
    navigator.clipboard.writeText(htmlLink);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setGroupLink('');
    setLinkText('Join our WhatsApp Group');
    setHtmlLink('');
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Link Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="group-link" className="flex items-center gap-2"><Users/>WhatsApp Group Invitation Link</Label>
                        <Input id="group-link" value={groupLink} onChange={e => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="link-text" className="flex items-center gap-2"><LinkIcon/>Link Text</Label>
                        <Input id="link-text" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="e.g., Join our Group"/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Generated HTML Link</CardTitle>
                    <CardDescription>Copy this code and paste it into your website's HTML.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto min-h-[150px]">
                        <code>{htmlLink || '<a href="...">...</a>'}</code>
                    </pre>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleCopy} disabled={!htmlLink} className="w-full">
                            <Copy className="mr-2 h-4 w-4"/> Copy HTML
                        </Button>
                         <Button onClick={handleClear} variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4"/> Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Button onClick={handleGenerate} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" /> Generate HTML Link
        </Button>
    </div>
  );
}
