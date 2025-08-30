
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export function LoremIpsumGenerator() {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    setText(loremIpsumText);
    toast({
        title: 'Generated!',
        description: 'Lorem Ipsum text has been generated.'
    });
  };

  const handleCopy = () => {
    if (!text) {
      toast({
        title: 'Nothing to copy!',
        description: 'Please generate some text first.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
       <Button onClick={handleGenerate} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Lorem Ipsum
        </Button>
      <div className="space-y-2">
        <Label htmlFor="text-output">Generated Text</Label>
        <Textarea
          id="text-output"
          value={text}
          readOnly
          placeholder="Generated text will appear here..."
          className="min-h-[200px] resize-y bg-muted"
        />
      </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
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
  );
}
