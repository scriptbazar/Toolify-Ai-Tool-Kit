
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Link, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UrlEncoderDecoder() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const handleEncode = () => {
    if (!inputText) {
      setOutputText('');
      return;
    }
    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
      toast({ title: "Text Encoded!" });
    } catch (e) {
      toast({ title: "Encoding Error", variant: "destructive" });
    }
  };

  const handleDecode = () => {
    if (!inputText) {
      setOutputText('');
      return;
    }
    try {
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
      toast({ title: "Text Decoded!" });
    } catch (e) {
      toast({ title: "Decoding Error", description: "The input string may not be correctly URI encoded.", variant: "destructive" });
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="input-text">Input</Label>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(inputText)} disabled={!inputText}><Copy className="h-4 w-4" /></Button>
                </div>
                <Textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text or URL to encode/decode..."
                    className="min-h-[200px]"
                />
            </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="output-text">Output</Label>
                     <Button variant="ghost" size="icon" onClick={() => handleCopy(outputText)} disabled={!outputText}><Copy className="h-4 w-4" /></Button>
                </div>
                <Textarea
                    id="output-text"
                    value={outputText}
                    readOnly
                    placeholder="Result will appear here..."
                    className="min-h-[200px] bg-muted"
                />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEncode} className="w-full">Encode</Button>
            <Button onClick={handleDecode} className="w-full">Decode</Button>
            <Button variant="destructive" onClick={handleClear} className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
        </div>
    </div>
  );
}
