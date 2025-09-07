
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { renderAsync } from 'docx-preview';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function WordToPdf() {
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setWordFile(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid .doc or .docx file.", variant: "destructive" });
    }
  };

  const handleConvert = async () => {
    if (!wordFile || !previewRef.current) {
      toast({ title: 'No file selected', description: 'Please upload a Word document.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      // Use docx-preview to render the document into an HTML element
      await renderAsync(wordFile, previewRef.current);
      
      // Use html2canvas and jsPDF to convert the rendered HTML to a PDF
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`converted-${wordFile.name}.pdf`);

      toast({ title: 'Success!', description: 'Your Word document has been converted to PDF.' });

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not convert the document.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      if (previewRef.current) {
        previewRef.current.innerHTML = ''; // Clear preview
      }
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".doc,.docx" />
        <div className="flex flex-col items-center">
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{wordFile ? `Selected: ${wordFile.name}` : 'Click or drag .doc/.docx file to upload'}</p>
        </div>
      </div>
      
      <Button onClick={handleConvert} disabled={isLoading || !wordFile} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Convert to PDF & Download
      </Button>

      {/* Hidden div for rendering */}
      <div ref={previewRef} className="hidden"></div>
    </div>
  );
}
