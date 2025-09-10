
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FilePlus2, Trash2, Download, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { mergePdfs } from '@/ai/flows/pdf-management';
import { Input } from '../ui/input';

interface FileWithPages {
    file: File;
    pages: string;
}

export function PdfMerger() {
  const [files, setFiles] = useState<FileWithPages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
      if (pdfFiles.length !== newFiles.length) {
          toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
      }
      setFiles(prev => [...prev, ...pdfFiles.map(file => ({ file, pages: '' }))]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePageChange = (index: number, pages: string) => {
    setFiles(prev => prev.map((item, i) => i === index ? { ...item, pages } : item));
  };
  
  const handleMerge = async () => {
    if (files.length < 1) {
      toast({ title: 'Please select at least one PDF file.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
        const filesToMerge = files.map(async (item) => {
            const pdfDataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) resolve(event.target.result as string);
                    else reject(new Error(`Failed to read file: ${item.file.name}.`));
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(item.file);
            });
            return { pdfDataUri, pages: item.pages };
        });

        const filesPayload = await Promise.all(filesToMerge);
        const result = await mergePdfs({ files: filesPayload });

        // Trigger download
        const link = document.createElement('a');
        link.href = result.mergedPdfDataUri;
        link.download = `merged-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: 'Success!', description: 'Your PDFs have been merged and downloaded.'});

    } catch (error: any) {
        console.error("PDF Merging Error:", error);
        toast({ title: 'Merge Failed', description: error.message || 'Could not merge PDFs.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
        <div className="flex flex-col items-center">
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
            <p className="text-xs text-muted-foreground">Select PDF files to merge.</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Selected Files ({files.length}):</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {files.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-sm truncate flex-1">{item.file.name}</p>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`pages-${index}`} className="text-xs shrink-0">Pages:</Label>
                    <Input
                      id={`pages-${index}`}
                      value={item.pages}
                      onChange={(e) => handlePageChange(index, e.target.value)}
                      placeholder="e.g. 1-3, 5, 7"
                      className="w-32 h-8"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleMerge} disabled={files.length === 0 || isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
        Merge and Download
      </Button>
    </div>
  );
}
