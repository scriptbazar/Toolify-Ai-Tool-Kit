
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '../ui/card';
import { composeEmail, type AiEmailComposerInput } from '@/ai/flows/ai-email-composer';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';

export function AiEmailComposer() {
  const [subject, setSubject] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject.trim() || !keyPoints.trim()) {
      toast({
        title: 'Fields are required',
        description: 'Please enter a subject and key points.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedBody('');
    try {
      const result = await composeEmail({ subject, keyPoints, tone: tone as AiEmailComposerInput['tone'] });
      setGeneratedBody(result.emailBody);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not compose the email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedBody) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedBody);
    toast({ title: 'Email body copied to clipboard!'});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Follow up on our meeting"/>
          </div>
          <div className="space-y-2">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Humorous">Humorous</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="key-points">Key Points / Message</Label>
          <Textarea
            id="key-points"
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="- Follow up on our last conversation about the project.&#10;- Ask for an estimated timeline.&#10;- Offer to help with any blockers."
            className="min-h-[200px]"
          />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate Email
        </Button>
      </div>

       <div className="space-y-4">
            <Label>Email Preview</Label>
            <Card className="h-full min-h-[400px]">
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm">
                            <Avatar className="w-8 h-8"><AvatarFallback>A</AvatarFallback></Avatar>
                            <div>
                                <p className="font-semibold">From: Admin</p>
                                <p className="text-muted-foreground">To: Recipient</p>
                            </div>
                        </div>
                         <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedBody}>
                            <Copy className="mr-2 h-4 w-4"/>Copy
                        </Button>
                    </div>
                    <Separator className="mt-4" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <h3 className="font-bold mb-4">{subject || 'Your Subject Here'}</h3>
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                            <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                            <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedBody || 'Generated email body will appear here...'}</p>
                    )}
                </CardContent>
            </Card>
             <Button className="w-full" disabled={!generatedBody}>
                <Send className="mr-2 h-4 w-4"/>
                Send Email (Not Implemented)
            </Button>
       </div>
    </div>
  );
}
