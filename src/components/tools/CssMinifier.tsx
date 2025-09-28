
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function CssMinifier() {
  const [originalCss, setOriginalCss] = useState('');
  const [minifiedCss, setMinifiedCss] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMinify = () => {
    if (!originalCss.trim()) {
        toast({ title: "Input is empty!", description: "Please enter some CSS to minify.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    // Simulate a short delay for a better UX
    setTimeout(() => {
        // Basic minification: remove comments, newlines, and extra whitespace
        const result = originalCss
            .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
            .replace(/\s*([,;:{}>])\s*/g, '$1') // remove space around delimiters
            .replace(/\s+/g, ' ') // collapse multiple whitespaces
            .trim();
        setMinifiedCss(result);
        setIsLoading(false);
    }, 500);
  };

  const handleCopy = () => {
    if (!minifiedCss) {
        toast({ title: "Nothing to copy!", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(minifiedCss);
    toast({ title: "Minified CSS copied!" });
  };
  
  const handleClear = () => {
    setOriginalCss('');
    setMinifiedCss('');
  }
  
  const originalSize = new Blob([originalCss]).size;
  const minifiedSize = new Blob([minifiedCss]).size;
  const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;


  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="original-css">Original CSS</Label>
                <Textarea 
                    id="original-css"
                    value={originalCss}
                    onChange={(e) => setOriginalCss(e.target.value)}
                    placeholder="/* Your beautiful, well-formatted CSS here */&#10;body {&#10;  background-color: #f0f0f0;&#10;  font-family: Arial, sans-serif;&#10;}"
                    className="min-h-[300px] font-mono"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="minified-css">Minified CSS</Label>
                <Textarea 
                    id="minified-css"
                    value={minifiedCss}
                    readOnly
                    placeholder="Minified output will appear here..."
                    className="min-h-[300px] font-mono bg-muted"
                />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleMinify} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                Minify CSS
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!minifiedCss} className="w-full">
                <Copy className="mr-2 h-4 w-4"/>Copy Minified CSS
            </Button>
             <Button variant="destructive" onClick={handleClear} disabled={!originalCss && !minifiedCss} className="w-full">
                <Trash2 className="mr-2 h-4 w-4"/>Clear
            </Button>
        </div>
        {minifiedCss && (
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
