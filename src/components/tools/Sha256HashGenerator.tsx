
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type CryptoJS from 'crypto-js';

type CryptoJsLibrary = {
    SHA256: (message: string) => CryptoJS.lib.WordArray;
};

export function Sha256HashGenerator() {
  const [inputText, setInputText] = useState('Hello World!');
  const [generatedHash, setGeneratedHash] = useState('');
  const [cryptoJs, setCryptoJs] = useState<CryptoJsLibrary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    import('crypto-js').then(module => {
        const cjs = module.default;
        setCryptoJs({
            SHA256: cjs.SHA256
        });
    }).catch(err => {
        console.error("Failed to load crypto-js", err);
        toast({
            title: "Library Error",
            description: "Could not load the required hashing library. Please refresh the page.",
            variant: "destructive"
        });
    });
  }, [toast]);
  
  useEffect(() => {
    if (cryptoJs) {
        handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, cryptoJs]);

  const handleGenerate = () => {
    if (!inputText) {
      setGeneratedHash('');
      return;
    }
    if (!cryptoJs) return;

    try {
      const hash = cryptoJs.SHA256(inputText).toString();
      setGeneratedHash(hash);
    } catch (e) {
      toast({ title: "Hashing Error", description: "Could not generate hash.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="input-text">Input Text</Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter any text you want to hash"
          className="min-h-[150px] font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hash-output">Generated SHA-256 Hash</Label>
        <div className="relative">
            <Input
                id="hash-output"
                value={generatedHash}
                readOnly
                placeholder="SHA-256 hash output will appear here"
                className="font-mono h-12 pr-12"
            />
            <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={handleCopy} disabled={!generatedHash}>
                <Copy className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
