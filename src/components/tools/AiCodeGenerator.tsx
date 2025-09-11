
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, FileText, Code, Settings, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { aiCodeGenerator, type AiCodeGeneratorOutput } from '@/ai/flows/ai-code-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


const CodeBlock = ({ language, code }: { language: string, code: string }) => (
    <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers>
        {code}
    </SyntaxHighlighter>
);

export function AiCodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('HTML/CSS/JS');
  const [generatedOutput, setGeneratedOutput] = useState<AiCodeGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is required',
        description: 'Please enter a description of the code you want to generate.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedOutput(null);
    try {
      const result = await aiCodeGenerator({ prompt, language });
      setGeneratedOutput(result);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate code.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, type: string) => {
    if (!content) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(content);
    toast({ title: `${type} copied to clipboard!`});
  };

  const renderCodeOutput = () => {
    if (!generatedOutput?.generatedCode) return null;

    const { html, css, javascript, code } = generatedOutput.generatedCode;
    
    if (html || css || javascript) {
        return (
            <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    {html && <TabsTrigger value="html">HTML</TabsTrigger>}
                    {css && <TabsTrigger value="css">CSS</TabsTrigger>}
                    {javascript && <TabsTrigger value="javascript">JavaScript</TabsTrigger>}
                </TabsList>
                {html && <TabsContent value="html"><CodeBlock language="markup" code={html} /></TabsContent>}
                {css && <TabsContent value="css"><CodeBlock language="css" code={css} /></TabsContent>}
                {javascript && <TabsContent value="javascript"><CodeBlock language="javascript" code={javascript} /></TabsContent>}
            </Tabs>
        );
    }
    
    if (code) {
        return <CodeBlock language={language.toLowerCase()} code={code} />;
    }

    return <p className="text-muted-foreground">No code was generated for this request.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="prompt-input">What do you want to build?</Label>
            <Textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'a responsive login form with a pulsating button effect'"
              className="min-h-[120px]"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="language-select">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="HTML/CSS/JS">HTML/CSS/JS</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="PHP">PHP</SelectItem>
                    <SelectItem value="SQL">SQL</SelectItem>
                </SelectContent>
            </Select>
             <Button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Code
            </Button>
        </div>
      </div>

      {(isLoading || generatedOutput) && (
        <div className="pt-6 border-t">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code"><Code className="mr-2 h-4 w-4"/>Code</TabsTrigger>
              <TabsTrigger value="setup"><Settings className="mr-2 h-4 w-4"/>Setup Instructions</TabsTrigger>
              <TabsTrigger value="explanation"><MessageSquare className="mr-2 h-4 w-4"/>Explanation</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-4">
                <Card>
                    <CardHeader><CardTitle>Generated Code</CardTitle></CardHeader>
                    <CardContent>
                       {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
                       {!isLoading && generatedOutput && renderCodeOutput()}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="setup" className="mt-4">
                <Card>
                    <CardHeader><CardTitle>Setup Instructions</CardTitle></CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                       {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
                       {!isLoading && generatedOutput && <div dangerouslySetInnerHTML={{ __html: generatedOutput.setupInstructions }} />}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="explanation" className="mt-4">
                <Card>
                    <CardHeader><CardTitle>Code Explanation</CardTitle></CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>}
                        {!isLoading && generatedOutput && <div dangerouslySetInnerHTML={{ __html: generatedOutput.codeExplanation }} />}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
