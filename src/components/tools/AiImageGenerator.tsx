
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Image from 'next/image';
import { generateImage } from '@/ai/flows/media-management';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AiImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [imageCount, setImageCount] = useState('1');
    const { toast } = useToast();
    const { user } = useAuth();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt is required", description: "Please describe the image you want to generate.", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "Login Required", description: "You must be logged in to generate images.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setGeneratedImages([]);

        try {
            const result = await generateImage({ 
                promptText: prompt, 
                userId: user.uid,
                count: parseInt(imageCount, 10),
            });
            setGeneratedImages(result.imageDataUris);

            toast({ title: 'Images Generated!', description: 'Your AI-powered images are ready.'});
        } catch (error: any) {
            toast({ title: 'Generation Failed', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-image-${index + 1}-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wand2/>AI Image Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A photorealistic image of an astronaut riding a horse on the moon"
                        className="min-h-[100px]"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mt-4">
                         <div className="space-y-2">
                            <Label htmlFor="image-count">Number of Images</Label>
                            <Select value={imageCount} onValueChange={setImageCount}>
                                <SelectTrigger id="image-count">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Image</SelectItem>
                                    <SelectItem value="2">2 Images</SelectItem>
                                    <SelectItem value="3">3 Images</SelectItem>
                                    <SelectItem value="4">4 Images</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full self-end">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Image(s)
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon/>Generating Images...</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: parseInt(imageCount, 10) }).map((_, i) => (
                             <div key={i} className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center relative">
                                <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
            )}

            {!isLoading && generatedImages.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon/>Generated Images</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {generatedImages.map((imgSrc, index) => (
                            <div key={index} className="space-y-2">
                                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                                     <Image src={imgSrc} alt={`Generated AI Image ${index + 1}`} layout="fill" objectFit="contain" className="p-2"/>
                                </div>
                                <Button onClick={() => handleDownload(imgSrc, index)} className="w-full">
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download Image {index + 1}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}

export default AiImageGenerator;
