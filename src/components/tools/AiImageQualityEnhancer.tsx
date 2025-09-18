
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Sparkles, Image as ImageIcon, Trash2, Loader2, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { enhanceImageQuality } from '@/ai/flows/ai-image-enhancer';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';

export function AiImageQualityEnhancer() {
  const [user, setUser] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
            toast({ title: 'File too large', description: 'Please upload an image smaller than 4MB.', variant: 'destructive'});
            return;
        }
      setImageFile(file);
      setResultImage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload a valid image file.", variant: "destructive" });
    }
  };

  const handleEnhance = async () => {
    if (!imagePreview || !user) {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to use this feature.", variant: "destructive" });
        } else {
            toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
        }
        return;
    }
    
    setIsLoading(true);
    setResultImage(null);
    try {
        const result = await enhanceImageQuality({
            imageDataUri: imagePreview,
            userId: user.uid,
            upscaleFactor: '2x', // Currently hardcoded, can be made into an option
        });
        setResultImage(result.imageDataUri);
        toast({ title: 'Image Enhanced!', description: 'The AI has processed your image.'});
    } catch (error: any) {
        toast({ title: "Processing Failed", description: error.message || 'Could not enhance the image.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!resultImage || !imageFile) return;
    const link = document.createElement('a');
    link.href = resultImage;
    const name = imageFile.name.split('.').slice(0, -1).join('.');
    link.download = `${name}-enhanced.png`;
    link.click();
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setResultImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
       <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg text-center cursor-pointer hover:bg-muted/50 flex items-center justify-center relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <div className="flex flex-col items-center">
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click or drag image to upload</p>
           <p className="text-xs text-muted-foreground">(Max 4MB)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {imagePreview && (
            <div className="space-y-2">
                <Label>Original Image</Label>
                <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src={imagePreview} alt="Original" width={400} height={400} className="object-contain max-h-full max-w-full"/>
                </div>
            </div>
          )}
          {isLoading && (
              <div className="space-y-2">
                <Label>Processing...</Label>
                <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                </div>
            </div>
          )}
          {resultImage && (
             <div className="space-y-2">
                <Label>Enhanced Image</Label>
                 <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src={resultImage} alt="Result" width={400} height={400} className="object-contain max-h-full max-w-full"/>
                </div>
            </div>
          )}
       </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
        <div className="flex gap-2">
           <Button onClick={handleEnhance} disabled={isLoading || !imageFile}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Enhance Quality
          </Button>
           <Button variant="outline" onClick={handleDownload} disabled={!resultImage}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
         <Button variant="destructive" size="sm" onClick={handleClear} disabled={!imageFile}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
