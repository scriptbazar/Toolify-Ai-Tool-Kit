'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Binary, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BinaryToText() {
  const [binaryInput, setBinaryInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const { toast } = useToast();

  const handleConvert = () => {
    if (!binaryInput.trim()) {
      toast({ title: 'Input is empty!', description: 'Please enter some binary code to convert.', variant: 'destructive' });
      return;
    }
    try {
      const text = binaryInput
        .split(' ')
        .map(bin => String.fromCharCode(parseInt(bin, 2)))
        .join('');
      setTextOutput(text);
    } catch (e) {
      toast({ title: 'Conversion Error', description: 'Invalid binary format. Ensure binary values are separated by spaces.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setBinaryInput('');
    setTextOutput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <Label htmlFor="binary-input">Binary Input</Label>
        <Textarea
          id="binary-input"
          value={binaryInput}
          onChange={(e) => setBinaryInput(e.target.value)}
          placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
          className="min-h-[250px] font-mono"
        />
         <Button onClick={handleConvert} className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Text
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="text-output">Text Output</Label>
        <Textarea
          id="text-output"
          value={textOutput}
          readOnly
          placeholder="Text will appear here..."
          className="min-h-[250px] font-mono bg-muted"
        />
        <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!textOutput}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear} disabled={!binaryInput && !textOutput}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
        </div>
      </div>
    </div>
  );
}
