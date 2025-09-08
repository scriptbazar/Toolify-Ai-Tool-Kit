
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCodeAssistant } from '@/ai/flows/ai-code-assistant';

export function JavascriptMinifier() {
  const [jsInput, setJsInput] = useState('');
  const [minifiedJs, setMinifiedJs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMinify = async () => {
    if (!jsInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some JavaScript to minify.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setMinifiedJs('');
    try {
      const result = await aiCodeAssistant({
        language: 'javascript',
        requestType: 'minify',
        code: jsInput,
      });
      setMinifiedJs(result.response);
    } catch (e: any) {
      toast({ title: 'Minification Failed', description: e.message || 'Could not minify JavaScript.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!minifiedJs) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(minifiedJs);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setJsInput('');
    setMinifiedJs('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="js-input">Original JavaScript</Label>
        <Textarea
          id="js-input"
          value={jsInput}
          onChange={(e) => setJsInput(e.target.value)}
          placeholder="Paste your JavaScript code here..."
          className="min-h-[300px] font-mono"
        />
        <div className="flex justify-between items-center">
            <Button onClick={handleMinify} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                Minify JS
            </Button>
             <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="minified-js">Minified JavaScript</Label>
        <Textarea
          id="minified-js"
          value={minifiedJs}
          readOnly
          placeholder="Minified JS will appear here..."
          className="min-h-[300px] font-mono bg-muted"
        />
        <Button onClick={handleCopy} variant="outline" className="w-full" disabled={!minifiedJs}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Minified JS
        </Button>
      </div>
    </div>
  );
}
