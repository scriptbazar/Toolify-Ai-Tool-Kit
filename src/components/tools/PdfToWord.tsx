
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileText, Loader2, FileDown, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';
import { Textarea } from '../ui/textarea';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();


export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedText('');
    } else {
      toast({ title: 'Invalid File', description: 'Please upload a valid PDF file.', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); };

  const handleConvert = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setExtractedText('');
    
    try {
        const fileBytes = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += pageText + '\n\n';
        }
        
        setExtractedText(fullText.trim());
        toast({ title: 'Text Extracted!', description: 'Text from the PDF has been extracted successfully.' });
    } catch (error: any) {
        console.error(error);
        toast({ title: 'Extraction Failed', description: error.message || 'Could not extract text from the PDF.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!extractedText) return;
    
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${extractedText.replace(/\n/g, '<br>')}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const originalName = file?.name.split('.')[0] || 'document';
    link.download = `${originalName}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    toast({ title: 'Text copied to clipboard!' });
  };
  
  const handleClear = () => {
      setFile(null);
      setExtractedText('');
  }

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
                    <h3 className="text-lg font-semibold">{file ? file.name : "Click or drag Word file to upload"}</h3>
                    <p className="text-sm text-muted-foreground">Your Word document will be converted to a PDF.</p>
                </div>
            </CardContent>
       </Card>

      <Button onClick={handleConvert} disabled={isLoading || !file} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
        Extract Text
      </Button>

       {(extractedText || isLoading) && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
            <CardDescription>
                This is the text content from your PDF. You can now copy it or download it as a Word file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
                value={isLoading ? "Extracting text, please wait..." : extractedText} 
                readOnly 
                className="min-h-[250px] bg-muted" 
            />
             <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={handleDownload} disabled={!extractedText || isLoading} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download as Word (.docx)
                </Button>
                <Button variant="outline" onClick={handleCopy} disabled={!extractedText || isLoading} className="w-full">
                    <Copy className="mr-2 h-4 w-4"/> Copy Text
                </Button>
                 <Button variant="destructive" onClick={handleClear} disabled={isLoading} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
