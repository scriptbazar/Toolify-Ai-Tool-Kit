
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Hash, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import type CryptoJS from 'crypto-js';

type HashingAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'RIPEMD160';

type CryptoJsLibrary = {
    [key in HashingAlgorithm]: (message: string) => CryptoJS.lib.WordArray;
};

export function UniversalHashGenerator() {
  const [inputText, setInputText] = useState('Hello World!');
  const [generatedHash, setGeneratedHash] = useState('');
  const [algorithm, setAlgorithm] = useState<HashingAlgorithm>('SHA256');
  const [cryptoJs, setCryptoJs] = useState<CryptoJsLibrary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    import('crypto-js').then(module => {
        const cjs = module.default;
        setCryptoJs({
            'MD5': cjs.MD5,
            'SHA1': cjs.SHA1,
            'SHA256': cjs.SHA256,
            'SHA512': cjs.SHA512,
            'RIPEMD160': cjs.RIPEMD160,
        });
    }).catch(err => {
        console.error("Failed to load crypto-js", err);
        toast({
            title: "Library Error",
            description: "Could not load the required encryption library. Please refresh the page.",
            variant: "destructive"
        });
    });
  }, [toast]);
  
  useEffect(() => {
    if (cryptoJs) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, algorithm, cryptoJs]);

  const handleGenerate = () => {
    if (!inputText) {
      setGeneratedHash('');
      return;
    }
    if (!cryptoJs) {
        toast({ title: "Library not loaded", description: "Hashing library is still loading...", variant: "destructive"});
        return;
    }

    try {
      const hashFunction = cryptoJs[algorithm];
      if (hashFunction) {
        const hash = hashFunction(inputText).toString();
        setGeneratedHash(hash);
      } else {
        throw new Error('Selected algorithm is not supported.');
      }
    } catch (e) {
      toast({ title: "Hashing Error", description: "Could not generate hash.", variant: "destructive" });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="algorithm-select">Hashing Algorithm</Label>
                <Select value={algorithm} onValueChange={(val) => setAlgorithm(val as HashingAlgorithm)}>
                    <SelectTrigger id="algorithm-select">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MD5">MD5</SelectItem>
                        <SelectItem value="SHA1">SHA-1</SelectItem>
                        <SelectItem value="SHA256">SHA-256</SelectItem>
                        <SelectItem value="SHA512">SHA-512</SelectItem>
                        <SelectItem value="RIPEMD160">RIPEMD-160</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      
        <div className="space-y-2">
            <Label htmlFor="hash-output">Generated Hash</Label>
            <div className="relative">
                <Input
                    id="hash-output"
                    value={generatedHash}
                    readOnly
                    placeholder="Hash output will appear here"
                    className="font-mono h-12 pr-12"
                />
                 <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => handleCopy(generatedHash)} disabled={!generatedHash}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
        </div>
    </div>
  );
}
