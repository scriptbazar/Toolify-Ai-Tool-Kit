
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Download, Pilcrow, CaseUpper, CaseLower, CaseSensitive, FlipHorizontal, Baseline } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CaseConverter() {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const toSentenceCase = () => {
    if (!text) return;
    const newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(newText);
  };

  const toLowerCase = () => setText(text.toLowerCase());
  const toUpperCase = () => setText(text.toUpperCase());

  const toTitleCase = () => {
    if (!text) return;
    const newText = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setText(newText);
  };

  const toAlternatingCase = () => {
    if (!text) return;
    const newText = text.split('').map((char, index) => 
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('');
    setText(newText);
  };

  const toInverseCase = () => {
    if (!text) return;
    const newText = text.split('').map(char => 
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    ).join('');
    setText(newText);
  };


  const handleCopy = () => {
    if (!text) {
      toast({ title: 'Nothing to copy!', description: 'The text area is empty.', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleDownload = () => {
    if (!text) {
      toast({ title: 'Nothing to download!', description: 'The text area is empty.', variant: 'destructive' });
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-text.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  const handleClear = () => {
    setText('');
    toast({ title: 'Text cleared!' });
  };

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphCount = text.split(/\n+/).filter(p => p.trim() !== '').length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text-input">Your Text</Label>
        <Textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="min-h-[200px] resize-y"
        />
      </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-2 border rounded-md text-center bg-muted">
            <span className="font-bold text-lg text-primary">{wordCount}</span>
            <p className="text-xs text-muted-foreground">Words</p>
        </div>
         <div className="p-2 border rounded-md text-center bg-muted">
            <span className="font-bold text-lg text-primary">{charCount}</span>
            <p className="text-xs text-muted-foreground">Characters</p>
        </div>
         <div className="p-2 border rounded-md text-center bg-muted">
            <span className="font-bold text-lg text-primary">{sentenceCount}</span>
            <p className="text-xs text-muted-foreground">Sentences</p>
        </div>
        <div className="p-2 border rounded-md text-center bg-muted">
            <span className="font-bold text-lg text-primary">{paragraphCount}</span>
            <p className="text-xs text-muted-foreground">Paragraphs</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button onClick={toSentenceCase} variant="outline"><CaseSensitive className="mr-2 h-4 w-4" />Sentence case</Button>
        <Button onClick={toLowerCase} variant="outline"><CaseLower className="mr-2 h-4 w-4" />lowercase</Button>
        <Button onClick={toUpperCase} variant="outline"><CaseUpper className="mr-2 h-4 w-4" />UPPERCASE</Button>
        <Button onClick={toTitleCase} variant="outline"><Baseline className="mr-2 h-4 w-4" />Title Case</Button>
        <Button onClick={toAlternatingCase} variant="outline"><Pilcrow className="mr-2 h-4 w-4" />aLtErNaTiNg cAsE</Button>
        <Button onClick={toInverseCase} variant="outline"><FlipHorizontal className="mr-2 h-4 w-4" />iNVERSE cASE</Button>
      </div>
       <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleDownload} title="Download as .txt">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to clipboard">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="destructive" size="icon" onClick={handleClear} title="Clear text">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
