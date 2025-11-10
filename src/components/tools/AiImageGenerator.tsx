
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

export function AiImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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
        setGeneratedImage(null);

        try {
            const result = await generateImage({ promptText: prompt, userId: user.uid });
            setGeneratedImage(result.imageDataUri);
            toast({ title: 'Image Generated!', description: 'Your AI-powered image is ready.'});
        } catch (error: any) {
            toast({ title: 'Generation Failed', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ai-image-${Date.now()}.png`;
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
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Image
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon/>Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center relative">
                        {isLoading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                        ) : generatedImage ? (
                            <Image src={generatedImage} alt="Generated AI Image" layout="fill" objectFit="contain" className="p-2"/>
                        ) : (
                            <p className="text-muted-foreground">Your generated image will appear here.</p>
                        )}
                    </div>
                     {generatedImage && !isLoading && (
                        <Button onClick={handleDownload} className="w-full mt-4">
                            <Download className="mr-2 h-4 w-4"/>
                            Download Image
                        </Button>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AiImageGenerator;
