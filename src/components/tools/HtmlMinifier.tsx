
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function HtmlMinifier() {
  const [originalHtml, setOriginalHtml] = useState('');
  const [minifiedHtml, setMinifiedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMinify = () => {
    if (!originalHtml.trim()) {
        toast({ title: "Input is empty!", description: "Please enter some HTML to minify.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    // Simulate a short delay for a better UX
    setTimeout(() => {
        // Basic minification: remove comments, newlines, and extra whitespace between tags
        const result = originalHtml
            .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
            .replace(/\s{2,}/g, ' ')         // collapse whitespace
            .replace(/>\s+</g, '><')          // remove space between tags
            .trim();
        setMinifiedHtml(result);
        setIsLoading(false);
    }, 500);
  };

  const handleCopy = () => {
    if (!minifiedHtml) {
        toast({ title: "Nothing to copy!", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(minifiedHtml);
    toast({ title: "Minified HTML copied!" });
  };
  
  const handleClear = () => {
    setOriginalHtml('');
    setMinifiedHtml('');
  }
  
  const originalSize = new Blob([originalHtml]).size;
  const minifiedSize = new Blob([minifiedHtml]).size;
  const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="original-html">Original HTML</Label>
                <Textarea 
                    id="original-html"
                    value={originalHtml}
                    onChange={(e) => setOriginalHtml(e.target.value)}
                    placeholder="<!-- Your HTML code here -->\n<html>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>"
                    className="min-h-[300px] font-mono"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="minified-html">Minified HTML</Label>
                <Textarea 
                    id="minified-html"
                    value={minifiedHtml}
                    readOnly
                    placeholder="Minified output will appear here..."
                    className="min-h-[300px] font-mono bg-muted"
                />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleMinify} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                Minify HTML
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!minifiedHtml} className="w-full">
                <Copy className="mr-2 h-4 w-4"/>Copy Minified HTML
            </Button>
             <Button variant="destructive" onClick={handleClear} disabled={!originalHtml && !minifiedHtml} className="w-full">
                <Trash2 className="mr-2 h-4 w-4"/>Clear
            </Button>
        </div>
        {minifiedHtml && (
            <Card>
                <CardHeader>
                    <CardTitle>Minification Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Original Size</p>
                        <p className="text-lg font-bold">{(originalSize / 1024).toFixed(2)} KB</p>
                    </div>
                     <div className="p-2 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Minified Size</p>
                        <p className="text-lg font-bold">{(minifiedSize / 1024).toFixed(2)} KB</p>
                    </div>
                     <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300">You Saved</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{savings.toFixed(2)}%</p>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
