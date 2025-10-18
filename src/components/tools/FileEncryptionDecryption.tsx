'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, KeyRound, FileText, Eye, EyeOff, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import CryptoJS from 'crypto-js';

export function FileEncryptionDecryption() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] || null);
        if (e.target) e.target.value = '';
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0] || null);
    };
    
    const processFile = async (mode: 'encrypt' | 'decrypt') => {
        if (!file || !password) {
            toast({ title: 'Missing Information', description: 'Please provide both a file and a password.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result;
                if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
                    throw new Error("Failed to read file.");
                }

                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
                let processedData;
                let processedFileName;

                if (mode === 'encrypt') {
                    processedData = CryptoJS.AES.encrypt(wordArray, password).toString();
                    processedFileName = `encrypted-${file.name}`;
                } else { // decrypt
                    const decrypted = CryptoJS.AES.decrypt(CryptoJS.lib.WordArray.create(new TextDecoder().decode(arrayBuffer) as any), password);
                    const typedArray = convertWordArrayToUint8Array(decrypted);
                    processedData = typedArray;
                    processedFileName = file.name.startsWith('encrypted-') ? file.name.replace('encrypted-', '') : `decrypted-${file.name}`;
                }
                
                const blob = new Blob([processedData]);
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = processedFileName;
                link.click();
                URL.revokeObjectURL(link.href);
                toast({ title: 'Success!', description: `Your file has been ${mode}ed and downloaded.`});
            };
             reader.onerror = () => {
                throw new Error("Failed to read file for processing.");
            };
        } catch (error: any) {
            console.error(`File ${mode}ion error:`, error);
            toast({ title: `${mode.charAt(0).toUpperCase() + mode.slice(1)}ion Failed`, description: 'Please check your password or file. The file might be corrupted or the password incorrect.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    function convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray) {
        const l = wordArray.sigBytes;
        const u8_array = new Uint8Array(l);
        for (let i = 0; i < l; i++) {
            u8_array[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return u8_array;
    }


    return (
        <div className="space-y-6">
            <Tabs defaultValue="encrypt" onValueChange={val => setActiveTab(val as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="encrypt"><Lock className="mr-2 h-4 w-4"/>Encrypt</TabsTrigger>
                    <TabsTrigger value="decrypt"><Unlock className="mr-2 h-4 w-4"/>Decrypt</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card 
                className={cn("transition-colors", isDragging && 'border-primary bg-primary/10')}
                onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
                <CardContent 
                    className="p-6 text-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <div className="flex flex-col items-center justify-center h-full">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">{file ? file.name : `Click or drag file to ${activeTab}`}</h3>
                        <p className="text-sm text-muted-foreground">Your file will be processed securely in your browser.</p>
                    </div>
                </CardContent>
            </Card>

            {file && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/>Set Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
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
                        <Button onClick={() => processFile(activeTab)} disabled={isLoading || !password} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (activeTab === 'encrypt' ? <Lock className="mr-2 h-4 w-4"/> : <Unlock className="mr-2 h-4 w-4"/>)}
                            {activeTab === 'encrypt' ? 'Encrypt & Download' : 'Decrypt & Download'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
