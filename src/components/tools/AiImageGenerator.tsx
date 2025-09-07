
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Download, GalleryVertical, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { generateImage, getUserMedia, type UserMedia } from '@/ai/flows/ai-image-generator';
import Image from 'next/image';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';


const MediaCard = ({ src, alt, onDownload }: { src: string, alt: string, onDownload: () => void }) => (
  <Card className="overflow-hidden group relative">
    <Image
      src={src}
      alt={alt}
      width={300}
      height={300}
      className="object-cover w-full h-full"
    />
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
       <Button size="icon" onClick={onDownload}><Download /></Button>
    </div>
  </Card>
);

export function AiImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userMedia, setUserMedia] = useState<UserMedia[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchUserMedia(firebaseUser.uid);
      } else {
        setLoadingMedia(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserMedia = async (uid: string) => {
    setLoadingMedia(true);
    try {
      const media = await getUserMedia(uid);
      setUserMedia(media);
    } catch (error) {
      console.error("Failed to fetch user media:", error);
      toast({ title: "Error", description: "Could not load your media gallery.", variant: "destructive" });
    } finally {
      setLoadingMedia(false);
    }
  };


  const handleGenerate = async () => {
    if (!user) {
        toast({ title: 'Login Required', description: 'Please log in to generate images.', variant: 'destructive'});
        return;
    }
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is required',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateImage({ promptText: prompt, userId: user.uid });
      setGeneratedImage(result.imageDataUri);
      // Refresh media gallery after generation
      fetchUserMedia(user.uid);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate the image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const aiGeneratedMedia = userMedia.filter(m => m.type === 'ai-generated');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt-input">Image Prompt</Label>
        <Textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photorealistic image of a cat wearing sunglasses, sitting on a beach"
          className="min-h-[100px]"
        />
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Image
      </Button>

        <div className="pt-4 border-t">
          {(isLoading || generatedImage) && (
              <Card>
                 <CardHeader><CardTitle>Generated Image</CardTitle></CardHeader>
                 <CardContent className="flex justify-center items-center">
                    {isLoading ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2"/>
                            <p className="text-muted-foreground">Generating your image...</p>
                        </div>
                    ) : generatedImage && (
                        <div className="relative group">
                            <Image src={generatedImage} alt={prompt} width={512} height={512} className="rounded-md" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button onClick={() => handleDownload(generatedImage, `generated_${Date.now()}.png`)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                        </div>
                    )}
                 </CardContent>
              </Card>
          )}
        </div>

        <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><GalleryVertical className="h-5 w-5"/>Your Media Gallery</h3>
            <Card>
                <CardContent className="p-4">
                    {loadingMedia ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : aiGeneratedMedia.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {aiGeneratedMedia.map(item => (
                                <MediaCard 
                                    key={item.id} 
                                    src={item.mediaUrl} 
                                    alt={item.prompt || 'AI generated image'}
                                    onDownload={() => handleDownload(item.mediaUrl, `${item.prompt?.substring(0, 20) || 'image'}.png`)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center min-h-[150px] text-center p-8 border-2 border-dashed rounded-lg">
                            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-lg text-muted-foreground">Your generated images will appear here.</p>
                            <p className="text-sm text-muted-foreground">Generated images are stored for 7 days.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
