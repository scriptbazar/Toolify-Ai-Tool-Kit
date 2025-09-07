
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCodeAssistant } from '@/ai/flows/ai-code-assistant';

export function CssMinifier() {
  const [cssInput, setCssInput] = useState('');
  const [minifiedCss, setMinifiedCss] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMinify = async () => {
    if (!cssInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some CSS to minify.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setMinifiedCss('');
    try {
      const result = await aiCodeAssistant({
        language: 'css',
        requestType: 'minify',
        code: cssInput,
      });
      setMinifiedCss(result.response);
    } catch (e: any) {
      toast({ title: 'Minification Failed', description: e.message || 'Could not minify CSS.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!minifiedCss) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(minifiedCss);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setCssInput('');
    setMinifiedCss('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="css-input">Original CSS</Label>
        <Textarea
          id="css-input"
          value={cssInput}
          onChange={(e) => setCssInput(e.target.value)}
          placeholder="Paste your CSS code here..."
          className="min-h-[300px] font-mono"
        />
        <div className="flex justify-between items-center">
            <Button onClick={handleMinify} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                Minify CSS
            </Button>
             <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="minified-css">Minified CSS</Label>
        <Textarea
          id="minified-css"
          value={minifiedCss}
          readOnly
          placeholder="Minified CSS will appear here..."
          className="min-h-[300px] font-mono bg-muted"
        />
        <Button onClick={handleCopy} variant="outline" className="w-full" disabled={!minifiedCss}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Minified CSS
        </Button>
      </div>
    </div>
  );
}
