
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, BookOpen, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { aiStoryVisualizer } from '@/ai/flows/ai-story-visualizer';
import { type Scene } from '@/ai/flows/ai-story-visualizer.types';
import { Skeleton } from '../ui/skeleton';


export function AiStoryVisualizer() {
  const [story, setStory] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!story.trim()) {
      toast({
        title: 'Story is required',
        description: 'Please enter a story to visualize.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setScenes([]);
    try {
      const result = await aiStoryVisualizer({ story });
      setScenes(result.scenes);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate scene prompts.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Prompt copied to clipboard!' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="story-input">Your Story</Label>
            <Textarea
              id="story-input"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Paste your story or chapter here..."
              className="min-h-[400px] resize-y"
            />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Scene Prompts
        </Button>
      </div>

       <div className="space-y-4">
            <Label>Generated Scenes</Label>
            <Card className="h-full min-h-[460px]">
                <CardContent className="p-0">
                    <ScrollArea className="h-[460px] p-4">
                        {isLoading && (
                             <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="p-4 border rounded-lg space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isLoading && scenes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <ImageIcon className="h-12 w-12 mb-4" />
                                <p className="font-semibold">Your visual prompts will appear here.</p>
                                <p className="text-sm">Enter your story and let the AI bring it to life!</p>
                            </div>
                        )}
                        <div className="space-y-4">
                        {scenes.map((scene, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/50">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Scene {index + 1}: <span className="font-normal italic text-muted-foreground ml-1">"{scene.sceneDescription}"</span>
                                </h4>
                                <div className="relative mt-2">
                                    <p className="text-xs text-foreground p-3 pr-10 rounded-md bg-background border font-mono">{scene.imagePrompt}</p>
                                     <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleCopy(scene.imagePrompt)}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
