
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WordCounter() {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleCopy = () => {
    if (!text) {
      toast({
        title: 'Nothing to copy!',
        description: 'The text area is empty.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The text has been copied successfully.',
    });
  };

  const handleClear = () => {
    setText('');
    toast({
      title: 'Text cleared!',
    });
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
          placeholder="Type or paste your text here to count words, characters, sentences, and paragraphs..."
          className="min-h-[200px] resize-y"
        />
      </div>
      
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg text-center bg-muted">
            <p className="text-2xl font-bold text-primary">{wordCount}</p>
            <p className="text-sm text-muted-foreground">Words</p>
        </div>
         <div className="p-4 border rounded-lg text-center bg-muted">
            <p className="text-2xl font-bold text-primary">{charCount}</p>
            <p className="text-sm text-muted-foreground">Characters</p>
        </div>
         <div className="p-4 border rounded-lg text-center bg-muted">
            <p className="text-2xl font-bold text-primary">{sentenceCount}</p>
            <p className="text-sm text-muted-foreground">Sentences</p>
        </div>
        <div className="p-4 border rounded-lg text-center bg-muted">
            <p className="text-2xl font-bold text-primary">{paragraphCount}</p>
            <p className="text-sm text-muted-foreground">Paragraphs</p>
        </div>
      </div>

       <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t">
        <div className="flex gap-2">
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
