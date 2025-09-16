
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, KeyRound, Loader2, File, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import CryptoJS from 'crypto-js';

export function AesEncryptionDecryption() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcessFile = async () => {
    if (!file || !password) {
      toast({ title: "File and password are required.", variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
        try {
            const fileData = e.target?.result;
            if (typeof fileData === 'string') {
                let processedData;
                let newFileName = '';

                if (mode === 'encrypt') {
                    processedData = CryptoJS.AES.encrypt(fileData, password).toString();
                    newFileName = `${file.name}.enc`;
                } else {
                    const bytes = CryptoJS.AES.decrypt(fileData, password);
                    processedData = bytes.toString(CryptoJS.enc.Utf8);
                    if (!processedData) {
                        throw new Error("Decryption failed. Check your password or file integrity.");
                    }
                    newFileName = file.name.replace(/\.enc$/, '') || `decrypted-${file.name}`;
                }

                const blob = new Blob([processedData], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = newFileName;
                link.click();
                URL.revokeObjectURL(link.href);
                
                toast({ title: `File successfully ${mode}ed!`, description: 'Your file has been downloaded.' });
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    fileReader.onerror = () => {
        toast({ title: 'Error', description: 'Failed to read the file.', variant: 'destructive' });
        setIsLoading(false);
    }

    fileReader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <RadioGroup value={mode} onValueChange={(val) => setMode(val as any)} className="grid grid-cols-2 gap-4">
        <Label htmlFor="encrypt" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
            <RadioGroupItem value="encrypt" id="encrypt" className="sr-only"/>Encrypt File
        </Label>
        <Label htmlFor="decrypt" className="p-4 border rounded-lg cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary text-center">
            <RadioGroupItem value="decrypt" id="decrypt" className="sr-only"/>Decrypt File
        </Label>
      </RadioGroup>
      
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {file ? (
            <div className="p-4 text-center">
                <File className="mx-auto h-12 w-12 text-primary mb-2" />
                <p className="font-semibold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
            </div>
        )}
      </div>

       <div className="space-y-2">
          <Label htmlFor="password">Secret Key / Password</Label>
          <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
              />
               <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </Button>
          </div>
        </div>

      <Button onClick={handleProcessFile} disabled={isLoading || !file || !password} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
        {mode === 'encrypt' ? 'Encrypt & Download' : 'Decrypt & Download'}
      </Button>
    </div>
  );
}
