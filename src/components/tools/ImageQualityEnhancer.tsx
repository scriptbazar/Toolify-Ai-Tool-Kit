'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Download, Sparkles, Image as ImageIcon, Trash2, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { enhanceImageQuality } from '@/ai/flows/ai-image-enhancer';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function ImageQualityEnhancer() {
  const [user, setUser] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [upscaleFactor, setUpscaleFactor] = useState('2x');
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
            upscaleFactor: upscaleFactor as '2x' | '4x'
        });
        setResultImage(result.imageDataUri);
        toast({ title: 'Image Enhanced!', description: 'The AI has processed your image.'});
    } catch (error: any) {
        toast({ title: "Enhancement Failed", description: error.message || 'Could not enhance the image.', variant: 'destructive'});
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
            <Label htmlFor="upscale-factor">Upscale Factor</Label>
            <Select value={upscaleFactor} onValueChange={setUpscaleFactor}>
                <SelectTrigger id="upscale-factor">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="2x">2x (Faster)</SelectItem>
                    <SelectItem value="4x">4x (Higher Quality)</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleEnhance} disabled={isLoading || !imageFile} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Enhance Image Quality
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-6 border-t">
          <div className="space-y-2">
              <Label>Original Image</Label>
              <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                    <Image src={imagePreview} alt="Original" width={400} height={400} className="object-contain max-h-full max-w-full"/>
                ) : <ImageIcon className="h-10 w-10 text-muted-foreground"/>}
              </div>
          </div>
          <div className="space-y-2">
            <Label>Enhanced Image</Label>
            <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                ) : resultImage ? (
                    <Image src={resultImage} alt="Result" width={400} height={400} className="object-contain max-h-full max-w-full"/>
                ) : <Sparkles className="h-10 w-10 text-muted-foreground"/>}
            </div>
            {resultImage && (
                 <Button variant="outline" onClick={handleDownload} className="w-full mt-2">
                    <Download className="mr-2 h-4 w-4" /> Download Enhanced Image
                  </Button>
            )}
          </div>
       </div>

        { (imageFile || resultImage) && (
            <div className="flex justify-end pt-4 border-t">
                <Button variant="destructive" size="sm" onClick={handleClear}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
                </Button>
            </div>
        )}
    </div>
  );
}