
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { aiCodeAssistant } from '@/ai/flows/ai-code-assistant';
import { cn } from '@/lib/utils';


export function AiCodeAssistant() {
  const [language, setLanguage] = useState('javascript');
  const [requestType, setRequestType] = useState<'generate' | 'debug' | 'explain'>('generate');
  const [code, setCode] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast({
        title: 'Input is required',
        description: `Please provide some ${requestType === 'generate' ? 'instructions' : 'code'}.`,
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedResponse('');
    try {
      const result = await aiCodeAssistant({ language, requestType, code });
      setGeneratedResponse(result.response);
    } catch (error: any) {
      toast({
        title: 'Request Failed',
        description: error.message || 'Could not process your request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResponse) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedResponse);
    toast({ title: 'Response copied to clipboard!'});
  };
  
  const getInputPlaceholder = () => {
      switch(requestType) {
          case 'generate':
            return 'e.g., "Create a Javascript function that returns the current date in YYYY-MM-DD format."';
          case 'debug':
            return 'e.g., "const x = 1\nconsole.log(y) // Why is this throwing an error?"';
          case 'explain':
            return 'e.g., "const sum = (a, b) => a + b;\nconsole.log(sum(2, 3));"';
          default:
            return 'Enter your code or request here...';
      }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <RadioGroup value={requestType} onValueChange={(val) => setRequestType(val as any)} className="flex gap-2">
                <Label htmlFor="generate" className={cn("flex-1 p-2 border rounded-md cursor-pointer text-center", requestType === 'generate' && "bg-primary text-primary-foreground border-primary")}>Generate</Label>
                <RadioGroupItem value="generate" id="generate" className="sr-only"/>
                <Label htmlFor="debug" className={cn("flex-1 p-2 border rounded-md cursor-pointer text-center", requestType === 'debug' && "bg-primary text-primary-foreground border-primary")}>Debug</Label>
                <RadioGroupItem value="debug" id="debug" className="sr-only"/>
                <Label htmlFor="explain" className={cn("flex-1 p-2 border rounded-md cursor-pointer text-center", requestType === 'explain' && "bg-primary text-primary-foreground border-primary")}>Explain</Label>
                <RadioGroupItem value="explain" id="explain" className="sr-only"/>
            </RadioGroup>
          </div>
       </div>

      <div className="space-y-2">
        <Label htmlFor="code-input">{requestType === 'generate' ? 'Instructions' : 'Your Code'}</Label>
        <Textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={getInputPlaceholder()}
          className="min-h-[200px] resize-y font-mono"
        />
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Execute
      </Button>

      {(generatedResponse || isLoading) && (
        <div className="pt-4 border-t">
          <Label>AI Response</Label>
          <Card className="mt-2">
            <CardHeader className="p-4">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Result</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedResponse}>
                        <Copy className="mr-2 h-4 w-4"/>
                        Copy
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-4 w-full bg-muted animate-pulse rounded-md" />)}
                    </div>
                ) : (
                    <div className="p-4 bg-muted rounded-md text-sm">
                        <pre className="whitespace-pre-wrap font-mono"><code>{generatedResponse}</code></pre>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
