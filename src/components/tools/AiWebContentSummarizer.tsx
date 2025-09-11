
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Link, FileText, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { summarizeAndExplainWebContent } from '@/ai/flows/ai-web-content-summarizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AiWebContentSummarizer() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ summary: string; explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProcessUrl = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL is required',
        description: 'Please enter a URL to process.',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        toast({ title: 'Invalid URL', description: 'Please enter a valid URL (e.g., https://example.com).', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await summarizeAndExplainWebContent({ url });
      setResult(response);
    } catch (error: any) {
      toast({
        title: 'Processing Failed',
        description: error.message || 'Could not process the content from the URL.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMarkdown = (text: string) => {
    // A simple markdown renderer for demonstration
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="h-12"
        />
        <Button onClick={handleProcessUrl} disabled={isLoading} className="h-12">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Process URL
        </Button>
      </div>
      
      {(result || isLoading) && (
        <Tabs defaultValue="summary" className="w-full pt-4 border-t">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary"><FileText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
              <TabsTrigger value="explanation"><Lightbulb className="mr-2 h-4 w-4" />Explanation</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
                <Card>
                    <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-sm">
                        {isLoading ? <p>Summarizing...</p> : renderMarkdown(result?.summary || '')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="explanation" className="mt-4">
                 <Card>
                    <CardHeader><CardTitle>Detailed Explanation</CardTitle></CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-sm">
                        {isLoading ? <p>Generating explanation...</p> : renderMarkdown(result?.explanation || '')}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      )}

    </div>
  );
}
