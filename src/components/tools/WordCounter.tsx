
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

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text-input">Your Text</Label>
        <Textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to count words and characters..."
          className="min-h-[200px] resize-y"
        />
      </div>
       <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{wordCount} Words</span>
          <span>{charCount} Characters</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="destructive" size="icon" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
