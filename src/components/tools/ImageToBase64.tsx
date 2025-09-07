
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadCloud, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ImageToBase64() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [base64String, setBase64String] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        setBase64String(result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };
  
  const handleCopy = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    toast({ title: "Base64 copied to clipboard!" });
  };
  
  const handleClear = () => {
      setImageSrc(null);
      setBase64String('');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label>Upload Image</Label>
        <div 
          className="w-full aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative bg-muted"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          {imageSrc ? (
              <Image src={imageSrc} alt="Preview" layout="fill" objectFit="contain" className="p-2" />
          ) : (
               <div className="flex flex-col items-center">
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
              </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="base64-output">Base64 Data URI</Label>
        <Textarea
          id="base64-output"
          value={base64String}
          readOnly
          className="min-h-[300px] font-mono bg-muted"
        />
        <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!base64String}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
            <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
        </div>
      </div>
    </div>
  );
}
