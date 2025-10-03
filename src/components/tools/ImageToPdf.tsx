
'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileDown, Loader2, Trash2, GripVertical, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface FileWithPreview {
  file: File;
  previewUrl: string;
  id: string;
}

export function ImageToPdf() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFile = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        toast({ title: 'No valid image files selected.', variant: 'destructive'});
        return;
    }

    const newFilesWithPreview = imageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${Math.random()}`
    }));

    setFiles(prev => [...prev, ...newFilesWithPreview]);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
    // Reset input value to allow re-uploading the same file
    if (e.target) e.target.value = '';
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFile(e.dataTransfer.files); };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.previewUrl);
    setFiles(prev => prev.filter((_, i) => i !== index));
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

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({ title: 'No images to convert.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();
        let image;
        if (item.file.type === 'image/jpeg') {
            image = await pdfDoc.embedJpg(fileBytes);
        } else {
            image = await pdfDoc.embedPng(fileBytes);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `converted-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: 'Success!', description: 'Your PDF has been created and downloaded.' });

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not convert images to PDF.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                <div className="flex flex-col items-center justify-center h-full">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Click or drag images to upload</h3>
                    <p className="text-sm text-muted-foreground">Select one or more images to convert to PDF.</p>
                </div>
            </CardContent>
       </Card>
      
       {files.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Image Queue ({files.length})</CardTitle>
                <CardDescription>Drag the images to reorder them for the PDF.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-72 w-full pr-4 border rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                        {files.map((item, index) => (
                           <div 
                             key={item.id} 
                             className="p-2 border rounded-lg bg-muted flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                             draggable
                             onDragStart={() => dragItem.current = index}
                             onDragEnter={() => dragOverItem.current = index}
                             onDragEnd={handleDragSort}
                             onDragOver={(e) => e.preventDefault()}
                           >
                              <GripVertical className="h-5 w-5 text-muted-foreground self-center shrink-0"/>
                              <div className="w-full aspect-square bg-white flex items-center justify-center shadow-md relative">
                                  <Image src={item.previewUrl} alt={`Preview ${index + 1}`} layout="fill" objectFit="contain" />
                              </div>
                              <p className="text-xs font-medium truncate w-full text-center">{item.file.name}</p>
                              <Button variant="destructive" size="sm" className="w-full" onClick={() => removeFile(index)}>
                                  <Trash2 className="mr-2 h-4 w-4"/> Remove
                              </Button>
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

      <Button onClick={handleConvert} disabled={isLoading || files.length === 0} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
        Convert & Download PDF
      </Button>
    </div>
  );
}
