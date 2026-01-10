
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
    if (!inputText) {
      setOutputText('');
      return;
    }
    try {
      // Handles UTF-8 characters correctly
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
    } catch (e) {
      toast({ title: "Encoding Error", description: "Could not encode the input.", variant: "destructive" });
    }
  };

  const handleDecode = () => {
    if (!inputText) {
      setOutputText('');
      return;
    }
    try {
       // Handles UTF-8 characters correctly
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
    } catch (e) {
      toast({ title: "Decoding Error", description: "The input is not a valid Base64 string.", variant: "destructive" });
    }
  };
  
  const handleSwap = () => {
      setInputText(outputText);
      setOutputText(inputText);
  };

  const handleCopyInput = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    toast({ title: 'Input copied to clipboard!' });
  };
  
  const handleCopyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Output copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 items-center">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="input-text">Input</Label>
             <Button variant="ghost" size="icon" onClick={handleCopyInput} disabled={!inputText}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to encode/decode..."
          className="min-h-[250px] font-mono"
        />
      </div>
      
      <div className="flex flex-col gap-2">
          <Button onClick={handleEncode} size="sm">Encode &raquo;</Button>
          <Button onClick={handleSwap} variant="outline" size="icon"><ArrowRightLeft className="h-4 w-4" /></Button>
          <Button onClick={handleDecode} size="sm">&laquo; Decode</Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="output-text">Output</Label>
             <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handleCopyOutput} disabled={!outputText}>
                    <Copy className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={handleClear} disabled={!inputText && !outputText}>
                    <Trash2 className="h-4 w-4" />
                </Button>
             </div>
        </div>
        <Textarea
          id="output-text"
          value={outputText}
          readOnly
          placeholder="Result will appear here..."
          className="min-h-[250px] font-mono bg-muted"
        />
      </div>
    </div>
  );
}

    