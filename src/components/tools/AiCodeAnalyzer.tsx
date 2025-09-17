
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Code, Loader2, Copy, Trash2, Languages, FileText, Lightbulb, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { aiCodeAnalyzer, type AiCodeAnalyzerOutput } from '@/ai/flows/ai-code-analyzer';
import { Badge } from '../ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function AiCodeAnalyzer() {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AiCodeAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: 'Code is required',
        description: 'Please paste some code to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await aiCodeAnalyzer({ code });
      setAnalysisResult(result);
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Could not analyze the code.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    setCode('');
    setAnalysisResult(null);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown to HTML for lists and bolding
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');

    return <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code-input">Code to Analyze</Label>
        <Textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code snippet here..."
          className="min-h-[250px] font-mono"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Analyze Code
        </Button>
        <Button variant="destructive" size="sm" onClick={handleClear} disabled={!code}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      {(analysisResult || isLoading) && (
        <div className="pt-6 border-t space-y-4">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Card><CardHeader><div className="h-6 w-1/2 bg-muted rounded-md animate-pulse"></div></CardHeader><CardContent><div className="h-24 w-full bg-muted rounded-md animate-pulse"></div></CardContent></Card>
                     <Card><CardHeader><div className="h-6 w-1/2 bg-muted rounded-md animate-pulse"></div></CardHeader><CardContent><div className="h-24 w-full bg-muted rounded-md animate-pulse"></div></CardContent></Card>
                </div>
            ) : analysisResult && (
                <>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Languages className="h-5 w-5"/> Detected Language
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge>{analysisResult.language}</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5"/> Code Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysisResult.summary}</p>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5"/> Line-by-Line Explanation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-muted rounded-md text-sm">
                            {renderMarkdown(analysisResult.explanation)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5"/> Improvement Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 bg-muted rounded-md text-sm">
                            {renderMarkdown(analysisResult.improvements)}
                        </div>
                    </CardContent>
                </Card>
                </>
            )}
        </div>
      )}
    </div>
  );
}
