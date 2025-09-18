
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Code, Loader2, Copy, Trash2, Languages, FileText, Lightbulb, Bot, ShieldCheck, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { aiCodeAssistant, type AiCodeAssistantOutput } from '@/ai/flows/ai-code-assistant';
import { Badge } from '../ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';


const CodeBlock = ({ language, code }: { language: string, code: string | undefined }) => {
    if (!code) return null;
    return (
        <div className="relative">
             <SyntaxHighlighter language={language.toLowerCase()} style={vscDarkPlus} showLineNumbers className="rounded-md">
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export function AiCodeAssistant() {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AiCodeAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>('summary');
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
      const result = await aiCodeAssistant({ code });
      setAnalysisResult(result);
      setOpenAccordionItem('summary');
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
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded-sm font-mono text-sm">$1</code>')
      .replace(/\n/g, '<br />');

    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  };
  
  const renderLoadingState = () => (
      <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
      </div>
  );
  
  const analysisSections = [
      { id: 'summary', title: 'Summary & Language', icon: FileText, content: (
          <div className="space-y-4">
            <Badge>{analysisResult?.language}</Badge>
            <p className="text-muted-foreground">{analysisResult?.summary}</p>
          </div>
      )},
      { id: 'explanation', title: 'Code Explanation', icon: Code, content: (
          <div className="p-4 bg-muted rounded-md text-sm">
            {renderMarkdown(analysisResult?.explanation || '')}
          </div>
      )},
      { id: 'performance', title: 'Performance Analysis', icon: BarChart2, content: (
           <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle>Time Complexity</CardTitle></CardHeader><CardContent><Badge variant="outline">{analysisResult?.performance.timeComplexity}</Badge></CardContent></Card>
                <Card><CardHeader><CardTitle>Space Complexity</CardTitle></CardHeader><CardContent><Badge variant="outline">{analysisResult?.performance.spaceComplexity}</Badge></CardContent></Card>
            </div>
            <p className="text-sm text-muted-foreground">{analysisResult?.performance.explanation}</p>
           </div>
      )},
      { id: 'security', title: 'Security Analysis', icon: ShieldCheck, content: (
           <div className="space-y-2">
               {analysisResult?.security?.vulnerabilities && analysisResult.security.vulnerabilities.length > 0 ? (
                   analysisResult.security.vulnerabilities.map((vuln, i) => (
                       <div key={i} className="p-2 border-l-4 border-destructive bg-destructive/10 rounded">
                           <p className="font-semibold">{vuln.type}</p>
                           <p className="text-xs">{vuln.risk}</p>
                       </div>
                   ))
               ) : (
                   <p className="text-sm text-green-600">{analysisResult?.security.summary}</p>
               )}
           </div>
      )},
      { id: 'improvements', title: 'Improvement Suggestions', icon: Lightbulb, content: (
            analysisResult?.improvements && analysisResult.improvements.length > 0 ? (
                <div className="space-y-4">
                    {analysisResult.improvements.map((item, index) => (
                        <div key={index} className="p-4 border rounded-md">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold mb-1 text-red-500">Before:</p>
                                    <CodeBlock language={analysisResult.language} code={item.before} />
                                </div>
                                <div>
                                     <p className="text-xs font-semibold mb-1 text-green-500">After:</p>
                                    <CodeBlock language={analysisResult.language} code={item.after} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-muted-foreground">No specific improvement suggestions found.</p>
      )},
  ]

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
        <div className="pt-6 border-t">
          <Accordion 
              type="single" 
              collapsible 
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
              value={openAccordionItem || ""}
              onValueChange={setOpenAccordionItem}
            >
              {analysisSections.map(section => {
                  const isOpen = openAccordionItem === section.id;
                  return (
                     <div key={section.id} className={cn(isOpen && "md:col-span-2")}>
                        <AccordionItem value={section.id} className="border rounded-lg">
                            <AccordionTrigger className="p-4">
                                <div className="flex items-center gap-2"><section.icon />{section.title}</div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                {isLoading ? renderLoadingState() : section.content}
                            </AccordionContent>
                        </AccordionItem>
                     </div>
                  )
              })}
          </Accordion>
        </div>
      )}
    </div>
  );
}
