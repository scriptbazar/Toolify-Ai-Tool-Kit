
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';

export function HtmlToMarkdownConverter() {
  const [htmlInput, setHtmlInput] = useState('<h1>Hello World</h1>\n<p>This is a <b>sample</b> conversion.</p>');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [debouncedHtml] = useDebounce(htmlInput, 500);
  const { toast } = useToast();

  useEffect(() => {
    if (!debouncedHtml.trim()) {
      setMarkdownOutput('');
      return;
    }
    
    // A very basic HTML to Markdown conversion logic
    let md = debouncedHtml
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, p1) => p1.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n'))
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, p1) => p1.replace(/<li[^>]*>(.*?)<\/li>/gi, (liMatch, liContent, offset) => `${(offset / liMatch.length) + 1}. ${liContent}\n`))
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<br\s*\/?>/gi, '  \n')
      .replace(/<hr\s*\/?>/gi, '---\n')
      .replace(/<[^>]+>/g, '') // Strip remaining tags
      .trim();
      
    setMarkdownOutput(md);

  }, [debouncedHtml]);

  const handleCopy = () => {
    if (!markdownOutput) return;
    navigator.clipboard.writeText(markdownOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setHtmlInput('');
    setMarkdownOutput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label htmlFor="html-input">HTML Input</Label>
        <Textarea
          id="html-input"
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="<h1>Hello</h1>"
          className="min-h-[300px] font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="markdown-output">Markdown Output</Label>
        <Textarea
          id="markdown-output"
          value={markdownOutput}
          readOnly
          placeholder="# Hello"
          className="min-h-[300px] font-mono bg-muted"
        />
        <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!markdownOutput}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!htmlInput && !markdownOutput}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}
