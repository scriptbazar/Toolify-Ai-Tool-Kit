
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, KeyRound, FileText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, PDFInvalidPasswordError } from 'pdf-lib';
import { cn } from '@/lib/utils';

export function UnlockPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/pdf') {
        setPdfFile(file);
    } else if (file) {
        toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); if(e.target) e.target.value = ''; };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleUnlock = async () => {
    if (!pdfFile) {
      toast({ title: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
     if (!password) {
      toast({ title: 'Password is required to unlock.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
        const fileBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes, { password });
        const unlockedPdfBytes = await pdfDoc.save();

        const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `unlocked-${pdfFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: 'Success!', description: 'Your PDF has been unlocked and downloaded.'});

    } catch (error: any) {
        console.error("PDF Unlock Error:", error);
        if (error instanceof PDFInvalidPasswordError) {
            toast({ title: 'Incorrect Password', description: 'The password you entered is incorrect. Please try again.', variant: 'destructive'});
        } else {
            toast({ title: 'Unlock Failed', description: 'Could not unlock the PDF. The file may be corrupted or not encrypted.', variant: 'destructive'});
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <Card 
            className={cn(
                "transition-colors",
                isDragging && 'border-primary bg-primary/10'
            )}
            onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
        >
             <CardContent 
                className="p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
                <div className="flex flex-col items-center justify-center h-full">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">{pdfFile ? pdfFile.name : "Click or drag PDF to upload"}</h3>
                    <p className="text-sm text-muted-foreground">Select the PDF file you want to unlock.</p>
                </div>
            </CardContent>
        </Card>
      
        {pdfFile && (
            <Card className="animate-in fade-in-50">
                <CardContent className="p-6 space-y-4">
                    <div className="p-3 bg-muted rounded-md flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium text-sm truncate">{pdfFile.name}</span>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="pdf-password">PDF Password</Label>
                            <div className="relative">
                                <Input
                                    id="pdf-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter the PDF password"
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <Button onClick={handleUnlock} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                            Unlock & Download
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
