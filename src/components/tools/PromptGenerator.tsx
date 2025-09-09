
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { generatePrompt } from '@/ai/flows/prompt-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GeneratePromptInput } from '@/ai/flows/prompt-generator.types';


export function PromptGenerator() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<GeneratePromptInput['category']>('Image');
  const [detailLevel, setDetailLevel] = useState<GeneratePromptInput['detailLevel']>('Detailed');
  
  // Style states for each category
  const [imageStyle, setImageStyle] = useState<GeneratePromptInput['imageStyle']>('Photorealistic');
  const [websiteStyle, setWebsiteStyle] = useState<GeneratePromptInput['websiteStyle']>('Minimalist');
  const [appStyle, setAppStyle] = useState<GeneratePromptInput['appStyle']>('Modern');
  const [socialMediaAdStyle, setSocialMediaAdStyle] = useState<GeneratePromptInput['socialMediaAdStyle']>('Friendly');
  const [videoScriptStyle, setVideoScriptStyle] = useState<GeneratePromptInput['videoScriptStyle']>('Explainer');
  const [marketingCopyStyle, setMarketingCopyStyle] = useState<GeneratePromptInput['marketingCopyStyle']>('Persuasive');
  const [creativeWritingStyle, setCreativeWritingStyle] = useState<GeneratePromptInput['creativeWritingStyle']>('Fantasy');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic or keywords to generate a prompt.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedPrompt('');

    const input: GeneratePromptInput = {
        topic,
        category,
        detailLevel,
        imageStyle: category === 'Image' ? imageStyle : undefined,
        websiteStyle: category === 'Website' ? websiteStyle : undefined,
        appStyle: category === 'App' ? appStyle : undefined,
        socialMediaAdStyle: category === 'Social Media Ad' ? socialMediaAdStyle : undefined,
        videoScriptStyle: category === 'Video Script' ? videoScriptStyle : undefined,
        marketingCopyStyle: category === 'Marketing Copy' ? marketingCopyStyle : undefined,
        creativeWritingStyle: category === 'Creative Writing' ? creativeWritingStyle : undefined,
    };

    try {
      const result = await generatePrompt(input);
      setGeneratedPrompt(result.prompt);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate a prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: 'Prompt copied to clipboard!'});
  };

  const renderStyleDropdown = () => {
      switch (category) {
          case 'Image':
              return (
                   <div className="space-y-2">
                        <Label htmlFor="image-style-select">Image Style</Label>
                        <Select value={imageStyle} onValueChange={(val) => setImageStyle(val as any)}>
                            <SelectTrigger id="image-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Photorealistic">Photorealistic</SelectItem>
                                <SelectItem value="Cartoon">Cartoon</SelectItem>
                                <SelectItem value="Abstract">Abstract</SelectItem>
                                <SelectItem value="Painting">Painting</SelectItem>
                                <SelectItem value="3D Render">3D Render</SelectItem>
                                <SelectItem value="Anime/Manga">Anime/Manga</SelectItem>
                                <SelectItem value="Pixel Art">Pixel Art</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
              );
          case 'Website':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="website-style-select">Website Style</Label>
                        <Select value={websiteStyle} onValueChange={(val) => setWebsiteStyle(val as any)}>
                            <SelectTrigger id="website-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Minimalist">Minimalist</SelectItem>
                                <SelectItem value="Corporate">Corporate</SelectItem>
                                <SelectItem value="Playful">Playful</SelectItem>
                                <SelectItem value="Modern">Modern</SelectItem>
                                <SelectItem value="Luxury">Luxury</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'App':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="app-style-select">App Style</Label>
                        <Select value={appStyle} onValueChange={(val) => setAppStyle(val as any)}>
                            <SelectTrigger id="app-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Clean">Clean</SelectItem>
                                <SelectItem value="Modern">Modern</SelectItem>
                                <SelectItem value="Gamified">Gamified</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Neumorphic">Neumorphic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'Social Media Ad':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="ad-style-select">Ad Tone/Style</Label>
                        <Select value={socialMediaAdStyle} onValueChange={(val) => setSocialMediaAdStyle(val as any)}>
                            <SelectTrigger id="ad-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="Friendly">Friendly</SelectItem>
                                <SelectItem value="Humorous">Humorous</SelectItem>
                                <SelectItem value="Inspirational">Inspirational</SelectItem>
                                <SelectItem value="Benefit-focused">Benefit-focused</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'Video Script':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="video-style-select">Video Type</Label>
                        <Select value={videoScriptStyle} onValueChange={(val) => setVideoScriptStyle(val as any)}>
                            <SelectTrigger id="video-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tutorial">Tutorial</SelectItem>
                                <SelectItem value="Commercial">Commercial</SelectItem>
                                <SelectItem value="Vlog">Vlog</SelectItem>
                                <SelectItem value="Explainer">Explainer</SelectItem>
                                <SelectItem value="Documentary">Documentary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'Marketing Copy':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="copy-style-select">Copy Tone</Label>
                        <Select value={marketingCopyStyle} onValueChange={(val) => setMarketingCopyStyle(val as any)}>
                            <SelectTrigger id="copy-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Persuasive">Persuasive</SelectItem>
                                <SelectItem value="Informative">Informative</SelectItem>
                                <SelectItem value="Inspirational">Inspirational</SelectItem>
                                <SelectItem value="Storytelling">Storytelling</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'Creative Writing':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="writing-style-select">Writing Genre</Label>
                        <Select value={creativeWritingStyle} onValueChange={(val) => setCreativeWritingStyle(val as any)}>
                            <SelectTrigger id="writing-style-select"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fantasy">Fantasy</SelectItem>
                                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                                <SelectItem value="Horror">Horror</SelectItem>
                                <SelectItem value="Mystery">Mystery</SelectItem>
                                <SelectItem value="Romance">Romance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
          default:
              return <div className="space-y-2"><Label>&nbsp;</Label><div className="h-10"></div></div>;
      }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic-input">Topic or Keywords</Label>
        <Textarea
          id="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., a futuristic city, a magical forest, a healthy breakfast recipe"
          className="min-h-[100px]"
        />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category-select">Prompt Category</Label>
                <Select value={category} onValueChange={(val) => setCategory(val as any)}>
                    <SelectTrigger id="category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Image">Image</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="App">App</SelectItem>
                        <SelectItem value="Social Media Ad">Social Media Ad</SelectItem>
                        <SelectItem value="Video Script">Video Script</SelectItem>
                        <SelectItem value="Marketing Copy">Marketing Copy</SelectItem>
                        <SelectItem value="Creative Writing">Creative Writing</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {renderStyleDropdown()}
             <div className="space-y-2">
                <Label htmlFor="detail-level-select">Prompt Detail Level</Label>
                <Select value={detailLevel} onValueChange={(val) => setDetailLevel(val as any)}>
                    <SelectTrigger id="detail-level-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Short">Short</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Detailed">Detailed</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>


      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Advanced Prompt
      </Button>

      {(generatedPrompt || isLoading) && (
        <div className="pt-4 border-t">
          <Label>Generated Prompt</Label>
          <Card className="mt-2">
            <CardContent className="p-4 relative">
                {isLoading ? (
                     <div className="flex items-center justify-center min-h-[100px]">
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <>
                    <p className="text-muted-foreground whitespace-pre-wrap">{generatedPrompt}</p>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                        <Copy className="h-4 w-4"/>
                    </Button>
                    </>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
