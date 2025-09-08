
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCodeAssistant } from '@/ai/flows/ai-code-assistant';

export function HtmlMinifier() {
  const [htmlInput, setHtmlInput] = useState('');
  const [minifiedHtml, setMinifiedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMinify = async () => {
    if (!htmlInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some HTML to minify.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setMinifiedHtml('');
    try {
      const result = await aiCodeAssistant({
        language: 'html',
        requestType: 'minify',
        code: htmlInput,
      });
      setMinifiedHtml(result.response);
    } catch (e: any) {
      toast({ title: 'Minification Failed', description: e.message || 'Could not minify HTML.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!minifiedHtml) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(minifiedHtml);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setHtmlInput('');
    setMinifiedHtml('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="html-input">Original HTML</Label>
        <Textarea
          id="html-input"
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="Paste your HTML code here..."
          className="min-h-[300px] font-mono"
        />
        <div className="flex justify-between items-center">
            <Button onClick={handleMinify} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                Minify HTML
            </Button>
             <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="minified-html">Minified HTML</Label>
        <Textarea
          id="minified-html"
          value={minifiedHtml}
          readOnly
          placeholder="Minified HTML will appear here..."
          className="min-h-[300px] font-mono bg-muted"
        />
        <Button onClick={handleCopy} variant="outline" className="w-full" disabled={!minifiedHtml}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Minified HTML
        </Button>
      </div>
    </div>
  );
}
