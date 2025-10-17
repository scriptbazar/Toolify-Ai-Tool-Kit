
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, KeyRound, Loader2, File as FileIcon, Eye, EyeOff, Lock, Unlock, ArrowRight, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { encryptOrDecryptFile } from '@/ai/flows/encryption-actions';

const ActionCard = ({ 
    title, 
    description, 
    onFileChange, 
    file, 
    onAction, 
    isLoading,
    buttonText,
    icon: Icon
}: { 
    title: string; 
    description: string;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    file: File | null;
    onAction: () => void;
    isLoading: boolean;
    buttonText: string;
    icon: React.ElementType;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(false); 
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
             if(fileInputRef.current) {
                fileInputRef.current.files = files;
                onFileChange({ target: fileInputRef.current } as ChangeEvent<HTMLInputElement>);
            }
        }
    };
    
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5"/>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div 
                    className={cn(
                        "w-full aspect-video border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative transition-colors",
                        isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                     {file ? (
                        <div className="p-4 text-center">
                            <FileIcon className="mx-auto h-12 w-12 text-primary mb-2" />
                            <p className="font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center p-4">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
                        </div>
                    )}
                 </div>
                 <Button onClick={onAction} disabled={isLoading || !file} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
};


export function FileEncryptionDecryption() {
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const processAndDownloadFile = async (mode: 'encrypt' | 'decrypt', file: File | null) => {
    if (!file || !password) {
      toast({ title: "File and password are required.", variant: 'destructive'});
      return;
    }

    setIsLoading(true);
    
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = async (e) => {
        try {
            const fileDataUrl = e.target?.result as string;
            if (!fileDataUrl) throw new Error("Could not read file.");

            const result = await encryptOrDecryptFile({
                mode,
                fileDataUrl,
                password
            });

            if (!result.success || !result.dataUrl) {
                throw new Error(result.message || "An unknown error occurred.");
            }

            const res = await fetch(result.dataUrl);
            const blob = await res.blob();
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = mode === 'encrypt' ? `${file.name}.enc` : file.name.replace(/\.enc$/, '') || `decrypted-${file.name}`;
            link.click();
            URL.revokeObjectURL(link.href);
            
            toast({ title: `File successfully ${mode}ed!`, description: 'Your file has been downloaded.' });
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
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/>Secret Key</CardTitle>
            <CardDescription>Enter the password you want to use for both encryption and decryption.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter a strong secret key or password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
            <ActionCard
                title="Encrypt File"
                description="Select a file to encrypt with your key."
                file={encryptFile}
                onFileChange={(e) => setEncryptFile(e.target.files?.[0] || null)}
                onAction={() => processAndDownloadFile('encrypt', encryptFile)}
                isLoading={isLoading}
                buttonText="Encrypt & Download"
                icon={Lock}
            />
             <div className="text-center">
                <ArrowRight className="h-8 w-8 text-muted-foreground hidden md:block"/>
                <div className="w-full h-px bg-border my-2 md:hidden"/>
             </div>
             <ActionCard
                title="Decrypt File"
                description="Select an encrypted file to decrypt."
                file={decryptFile}
                onFileChange={(e) => setDecryptFile(e.target.files?.[0] || null)}
                onAction={() => processAndDownloadFile('decrypt', decryptFile)}
                isLoading={isLoading}
                buttonText="Decrypt & Download"
                icon={Unlock}
            />
      </div>
    </div>
  );
}
