
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, KeyRound, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type CryptoJS from 'crypto-js';

type CryptoJsLibrary = {
    AES: {
        encrypt: (message: string, key: string) => any;
        decrypt: (ciphertext: string, key: string) => any;
    };
    enc: {
        Utf8: any;
    };
};

export function AesEncryptionDecryption() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cryptoJs, setCryptoJs] = useState<CryptoJsLibrary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    import('crypto-js').then(module => {
        const cjs = module.default;
        setCryptoJs({
            AES: cjs.AES,
            enc: cjs.enc,
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

  const handleEncrypt = () => {
    if (!inputText || !password || !cryptoJs) {
      toast({ title: 'Input and Password are required.', variant: 'destructive' });
      return;
    }
    try {
      const encrypted = cryptoJs.AES.encrypt(inputText, password).toString();
      setOutputText(encrypted);
      toast({ title: 'Text Encrypted!' });
    } catch (e) {
      toast({ title: "Encryption Error", variant: "destructive" });
    }
  };

  const handleDecrypt = () => {
    if (!inputText || !password || !cryptoJs) {
      toast({ title: 'Input and Password are required.', variant: 'destructive' });
      return;
    }
    try {
      const bytes = cryptoJs.AES.decrypt(inputText, password);
      const decrypted = bytes.toString(cryptoJs.enc.Utf8);
      if (!decrypted) {
          throw new Error("Decryption failed. Check your password or input text.");
      }
      setOutputText(decrypted);
      toast({ title: 'Text Decrypted!' });
    } catch (e: any) {
      toast({ title: "Decryption Error", description: e.message || 'Invalid key or ciphertext.', variant: "destructive" });
      setOutputText('');
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setPassword('');
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="password">Secret Key / Password</Label>
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <Label htmlFor="input-text">Input Text</Label>
          <Textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your sensitive text here..."
            className="min-h-[250px] font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="output-text">Output Text</Label>
          <Textarea
            id="output-text"
            value={outputText}
            readOnly
            placeholder="Result will appear here..."
            className="min-h-[250px] font-mono bg-muted"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleEncrypt} disabled={!cryptoJs} className="w-full">
            <Lock className="mr-2 h-4 w-4" /> Encrypt
          </Button>
          <Button onClick={handleDecrypt} disabled={!cryptoJs} className="w-full">
            <Unlock className="mr-2 h-4 w-4" /> Decrypt
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!outputText} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Result
          </Button>
          <Button variant="destructive" onClick={handleClear} disabled={!inputText && !outputText} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
      </div>
    </div>
  );
}
