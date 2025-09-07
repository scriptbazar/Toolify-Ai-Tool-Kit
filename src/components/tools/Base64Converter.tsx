
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Base64Converter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleEncode = () => {
    try {
      const encoded = btoa(inputText);
      setOutputText(encoded);
    } catch (e) {
      toast({ title: "Encoding Error", description: "Could not encode the input.", variant: "destructive" });
    }
  };

  const handleDecode = () => {
    try {
      const decoded = atob(inputText);
      setOutputText(decoded);
    } catch (e) {
      toast({ title: "Decoding Error", description: "The input is not a valid Base64 string.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!outputText) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="input-text">Input</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to encode/decode..."
          className="min-h-[150px]"
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button onClick={handleEncode}>Encode</Button>
        <Button onClick={handleDecode}>Decode</Button>
      </div>
      <div>
        <Label htmlFor="output-text">Output</Label>
        <Textarea
          id="output-text"
          value={outputText}
          readOnly
          placeholder="Result will appear here..."
          className="min-h-[150px] bg-muted"
        />
      </div>
       <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
