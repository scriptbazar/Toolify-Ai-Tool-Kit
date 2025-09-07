
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { summarizeContent } from '@/ai/flows/ai-content-summarizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AiContentSummarizer() {
  const [textToSummarize, setTextToSummarize] = useState('');
  const [summaryLength, setSummaryLength] = useState('Medium');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!textToSummarize.trim()) {
      toast({
        title: 'Text is required',
        description: 'Please enter some text to summarize.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedSummary('');
    try {
      const result = await summarizeContent({ textToSummarize, summaryLength: summaryLength as any });
      setGeneratedSummary(result.summary);
    } catch (error: any) {
      toast({
        title: 'Summarization Failed',
        description: error.message || 'Could not generate a summary.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedSummary) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedSummary);
    toast({ title: 'Summary copied to clipboard!'});
  };

  const handleClear = () => {
      setTextToSummarize('');
      setGeneratedSummary('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-summarize">Text to Summarize</Label>
            <Textarea
              id="text-to-summarize"
              value={textToSummarize}
              onChange={(e) => setTextToSummarize(e.target.value)}
              placeholder="Paste your long article, document, or text here..."
              className="min-h-[300px] resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary-length">Summary Length</Label>
            <Select value={summaryLength} onValueChange={setSummaryLength}>
                <SelectTrigger id="summary-length">
                    <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Detailed">Detailed</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Summarize
            </Button>
            <Button variant="destructive" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
          </div>
      </div>

      <div className="space-y-2">
        <Label>Generated Summary</Label>
        <Card className="h-full min-h-[400px]">
            <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Summary</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedSummary}>
                        <Copy className="mr-2 h-4 w-4"/>
                        Copy
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isLoading ? (
                     <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                    </div>
                ) : (
                    <div
                        className="prose dark:prose-invert max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: generatedSummary.replace(/\n/g, '<br />') }}
                    />
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
