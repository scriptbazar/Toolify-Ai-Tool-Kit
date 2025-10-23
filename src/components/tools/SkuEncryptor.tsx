'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, ArrowRightLeft, KeyRound, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type CryptoJS from 'crypto-js';

type CryptoJsLibrary = {
    AES: {
        encrypt: (message: string, key: string) => CryptoJS.lib.CipherParams;
        decrypt: (ciphertext: string, key: string) => CryptoJS.lib.WordArray;
    };
    enc: {
        Utf8: {
            parse: (s: string) => CryptoJS.lib.WordArray;
            stringify: (wordArray: CryptoJS.lib.WordArray) => string;
        };
    };
};

export function SkuEncryptor() {
  const [inputText, setInputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [cryptoJs, setCryptoJs] = useState<CryptoJsLibrary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    import('crypto-js').then(module => {
        const cjs = module.default;
        setCryptoJs({
            AES: cjs.AES,
            enc: {
                Utf8: cjs.enc.Utf8,
                stringify: cjs.enc.Utf8.stringify,
            }
        });
    }).catch(err => {
        console.error("Failed to load crypto-js", err);
        toast({ title: "Library Error", description: "Could not load the required encryption library.", variant: "destructive"});
    });
  }, [toast]);
  
  const handleEncrypt = () => {
    if (!inputText || !secretKey) {
        toast({ title: 'Input Required', description: 'Please provide both SKU/text and a secret key.', variant: 'destructive'});
        return;
    }
    if (!cryptoJs) return;

    try {
      const encrypted = cryptoJs.AES.encrypt(inputText, secretKey).toString();
      setOutputText(encrypted);
    } catch (e) {
      toast({ title: 'Encryption Error', variant: 'destructive'});
    }
  };

  const handleDecrypt = () => {
    if (!inputText || !secretKey) {
        toast({ title: 'Input Required', description: 'Please provide both encrypted text and a secret key.', variant: 'destructive'});
        return;
    }
    if (!cryptoJs) return;

    try {
      const bytes = cryptoJs.AES.decrypt(inputText, secretKey);
      const originalText = bytes.toString(cryptoJs.enc.Utf8);

      if (originalText) {
          setOutputText(originalText);
      } else {
          throw new Error('Decryption failed. Check key or input.');
      }
    } catch (e) {
       toast({ title: 'Decryption Error', description: 'Decryption failed. Make sure the secret key and encrypted text are correct.', variant: 'destructive'});
    }
  };
  
  const handleSwap = () => {
      setInputText(outputText);
      setOutputText(inputText);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setSecretKey('');
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="secret-key" className="flex items-center gap-2"><KeyRound className="h-4 w-4"/>Secret Key</Label>
             <div className="relative">
                <Input
                    id="secret-key"
                    type={showKey ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your secret key for encryption/decryption"
                />
                 <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 items-center">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="input-text">Input (SKU or Encrypted Text)</Label>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(inputText)} disabled={!inputText} title="Copy Input"><Copy className="h-4 w-4" /></Button>
                </div>
                <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter SKU to encrypt or encrypted text to decrypt..."
                className="min-h-[200px] font-mono"
                />
            </div>
            
            <div className="flex flex-col gap-2">
                <Button onClick={handleEncrypt}><Lock className="mr-2 h-4 w-4"/>Encrypt &raquo;</Button>
                <Button onClick={handleSwap} variant="outline" size="icon"><ArrowRightLeft className="h-4 w-4" /></Button>
                <Button onClick={handleDecrypt}><Unlock className="mr-2 h-4 w-4"/>&laquo; Decrypt</Button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="output-text">Output</Label>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(outputText)} disabled={!outputText} title="Copy Output"><Copy className="h-4 w-4" /></Button>
                </div>
                <Textarea
                id="output-text"
                value={outputText}
                readOnly
                placeholder="Result will appear here..."
                className="min-h-[200px] font-mono bg-muted"
                />
            </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
            <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText && !secretKey}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
        </div>
    </div>
  );
}

export default SkuEncryptor;
    