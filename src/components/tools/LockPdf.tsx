
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, Download, Loader2, KeyRound, FileText, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, StandardFonts, rgb, PDFFont, PermissionFlag } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

export function LockPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
      print: true,
      modify: false,
      copy: true,
      annotate: true,
  });
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

  const handleLock = async () => {
    if (!pdfFile) {
      toast({ title: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
     if (!password) {
      toast({ title: 'Please enter a password.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const perms: PermissionFlag[] = [];
      if (permissions.print) perms.push(PermissionFlag.Print);
      if (permissions.modify) perms.push(PermissionFlag.Modify);
      if (permissions.copy) perms.push(PermissionFlag.Copy);
      if (permissions.annotate) perms.push(PermissionFlag.Annotate);
      
      pdfDoc.setProducer('ToolifyAI PDF Locker');
      pdfDoc.setCreator('ToolifyAI');
      
      await pdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password, // You can set a different owner password if needed
          permissions: {
              printing: permissions.print,
              modifying: permissions.modify,
              copying: permissions.copy,
              annotating: permissions.annotate,
          }
      });
      
      const newPdfBytes = await pdfDoc.save();

      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `locked-${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({ title: 'Success!', description: 'Your PDF has been locked and downloaded.' });

    } catch (error: any) {
        console.error("PDF Locking Error:", error);
        toast({ title: 'Lock Failed', description: error.message || 'Could not lock the PDF.', variant: 'destructive'});
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
                    <p className="text-sm text-muted-foreground">Select the PDF file you want to protect.</p>
                </div>
            </CardContent>
        </Card>
      
        {pdfFile && (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock/>Encryption Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="pdf-password">Set a Password</Label>
                        <div className="relative">
                            <Input
                                id="pdf-password"
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
                    <div>
                        <Label className="flex items-center gap-2 mb-2"><Shield/>Set Permissions</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2"><Checkbox id="perm-print" checked={permissions.print} onCheckedChange={(c) => setPermissions(p => ({...p, print: !!c}))}/><Label htmlFor="perm-print">Allow Printing</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="perm-copy" checked={permissions.copy} onCheckedChange={(c) => setPermissions(p => ({...p, copy: !!c}))}/><Label htmlFor="perm-copy">Allow Copying</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="perm-modify" checked={permissions.modify} onCheckedChange={(c) => setPermissions(p => ({...p, modify: !!c}))}/><Label htmlFor="perm-modify">Allow Modifying</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="perm-annotate" checked={permissions.annotate} onCheckedChange={(c) => setPermissions(p => ({...p, annotate: !!c}))}/><Label htmlFor="perm-annotate">Allow Annotating</Label></div>
                        </div>
                    </div>
                     <Button onClick={handleLock} disabled={isLoading || !password} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                        Lock & Download PDF
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
