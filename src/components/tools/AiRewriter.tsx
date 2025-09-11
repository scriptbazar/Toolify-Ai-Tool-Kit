
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiRewriter } from '@/ai/flows/ai-rewriter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AiRewriter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [goal, setGoal] = useState('Improve Clarity');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input is empty!',
        description: 'Please enter some text to rewrite.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setOutputText('');
    try {
      const result = await aiRewriter({
        textToRewrite: inputText,
        goal: goal as any,
      });
      setOutputText(result.rewrittenText);
    } catch (e: any) {
      toast({
        title: 'Rewrite Failed',
        description: e.message || 'Could not rewrite the text.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="goal-select">What is your goal?</Label>
            <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger id="goal-select">
                    <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Improve Clarity">Improve Clarity</SelectItem>
                    <SelectItem value="Make it Formal">Make it Formal</SelectItem>
                    <SelectItem value="Make it Casual">Make it Casual</SelectItem>
                    <SelectItem value="Fix Grammar & Spelling">Fix Grammar & Spelling</SelectItem>
                    <SelectItem value="Shorten">Shorten</SelectItem>
                    <SelectItem value="Expand">Expand</SelectItem>
                </SelectContent>
            </Select>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="input-text">Original Text</Label>
          <Textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste the text you want to rewrite here..."
            className="min-h-[300px] font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="output-text">Rewritten Text</Label>
          <Textarea
            id="output-text"
            value={outputText}
            readOnly
            placeholder="The rewritten text will appear here..."
            className="min-h-[300px] font-mono bg-muted"
          />
        </div>
      </div>
       <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRewrite} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                Rewrite
            </Button>
             <Button variant="outline" onClick={handleCopy} disabled={!outputText} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Result
            </Button>
            <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    </div>
  );
}
