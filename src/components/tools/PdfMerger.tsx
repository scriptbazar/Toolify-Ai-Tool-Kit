
'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FilePlus2, Trash2, Download, Loader2, UploadCloud, GripVertical, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { mergePdfs } from '@/ai/flows/pdf-management';
import { Input } from '../ui/input';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface FileWithPages {
    file: File;
    pages: string;
    totalPages?: number;
    id: string;
}

export function PdfMerger() {
  const [files, setFiles] = useState<FileWithPages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFile = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== newFiles.length) {
        toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive'});
    }
    
    const filesWithPageCounts = await Promise.all(pdfFiles.map(async (file) => {
      try {
        const fileBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        return { file, pages: '', totalPages: pdfDoc.getPageCount(), id: `${file.name}-${Math.random()}` };
      } catch (error) {
        console.error(`Failed to read PDF ${file.name}:`, error);
        toast({ title: `Error reading ${file.name}`, description: 'Could not determine the number of pages. The file might be encrypted.', variant: 'destructive'});
        return { file, pages: '', totalPages: undefined, id: `${file.name}-${Math.random()}` };
      }
    }));

    setFiles(prev => [...prev, ...filesWithPageCounts]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation(); setIsDragging(false);
      handleFile(e.dataTransfer.files);
  };
  
  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newFiles = [...files];
    const draggedItemContent = newFiles.splice(dragItem.current, 1)[0];
    newFiles.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFiles(newFiles);
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
       <Card 
            className={cn(
                "transition-colors",
                isDragging ? 'border-primary bg-primary/10' : 'border-border'
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <CardContent 
                className="p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
                 <div className="flex flex-col items-center justify-center h-full">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Click or drag files to upload</h3>
                    <p className="text-sm text-muted-foreground">Select one or more PDF files to merge together.</p>
                </div>
            </CardContent>
       </Card>
      
      {files.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>File Queue ({files.length})</CardTitle>
                <CardDescription>Drag files to reorder them before merging.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72 w-full pr-4">
                    <div className="space-y-2">
                        {files.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="p-3 border rounded-lg bg-muted/50 flex items-center gap-4 cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={() => dragItem.current = index}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={handleDragSort}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0"/>
                            <FileText className="h-5 w-5 text-primary shrink-0"/>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium text-sm truncate">{item.file.name}</p>
                                {item.totalPages !== undefined && (
                                    <p className="text-xs text-muted-foreground">({item.totalPages} pages)</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`pages-${index}`} className="text-xs shrink-0">Pages:</Label>
                                <Input
                                id={`pages-${index}`}
                                value={item.pages}
                                onChange={(e) => handlePageChange(index, e.target.value)}
                                placeholder="e.g. 1-3, 5"
                                className="w-32 h-8"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                        ))}
                    </div>
                 </ScrollArea>
                 <div className="flex justify-end mt-4">
                     <Button variant="secondary" onClick={() => setFiles([])}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Clear All
                    </Button>
                 </div>
            </CardContent>
        </Card>
      )}

      <Button onClick={handleMerge} disabled={files.length === 0 || isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
        Merge and Download
      </Button>
    </div>
  );
}
