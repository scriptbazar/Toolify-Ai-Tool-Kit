
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePlus2, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';

export function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleMerge = () => {
    if (files.length < 2) {
      toast({ title: 'Please select at least two PDF files.', variant: 'destructive' });
      return;
    }
    toast({ title: 'PDF merging is not implemented yet.'});
    // PDF merging logic would go here
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pdf-upload">Upload PDF Files</Label>
        <Input id="pdf-upload" type="file" accept=".pdf" multiple onChange={handleFileChange} />
        <p className="text-sm text-muted-foreground">Select two or more PDF files to merge.</p>
      </div>
      
      {files.length > 0 && (
        <Card>
            <CardContent className="p-4 space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                <ul className="space-y-2">
                    {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                           <span>{file.name}</span>
                           <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                             <Trash2 className="h-4 w-4 text-red-500" />
                           </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={handleMerge} disabled={files.length < 2}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Merge PDFs
        </Button>
      </div>
    </div>
  );
}
