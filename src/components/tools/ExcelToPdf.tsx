
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UploadCloud, FileText, Loader2, FileDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setFile(selectedFile);
      } else {
        toast({ title: 'Invalid File', description: 'Please upload an Excel or CSV file.', variant: 'destructive' });
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Take the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
            throw new Error("The Excel file is empty.");
        }

        const doc = new jsPDF();
        doc.setFontSize(18).text(file.name.replace(/\.[^/.]+$/, ""), 14, 22);
        
        (doc as any).autoTable({
          head: [jsonData[0]],
          body: jsonData.slice(1),
          startY: 30,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [76, 35, 137], textColor: 255 },
        });

        doc.save(`${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
        toast({ title: 'Success!', description: 'Excel has been converted to PDF.' });
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({ title: 'Conversion Failed', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card 
        className="transition-colors border-2 border-dashed border-muted-foreground/30 hover:bg-muted/50"
      >
        <CardContent 
          className="p-10 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls,.csv" />
          <div className="flex flex-col items-center justify-center">
            <UploadCloud className="mx-auto h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-bold">{file ? file.name : "Upload Excel or CSV"}</h3>
            <p className="text-muted-foreground mt-2">Convert spreadsheets to clean, professional PDFs.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleConvert} disabled={!file || isLoading} className="w-full h-12 text-lg">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <FileDown className="mr-2 h-5 w-5" />}
            Convert to PDF
        </Button>
        {file && (
            <Button variant="destructive" onClick={() => setFile(null)} className="h-12"><Trash2 className="h-5 w-5"/></Button>
        )}
      </div>
    </div>
  );
}
