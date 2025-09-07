
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiStoryGenerator } from '@/ai/flows/ai-story-generator';

export function AiStoryGenerator() {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic to generate a story.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedStory('');
    try {
      const result = await aiStoryGenerator({ topic, genre: genre as any });
      setGeneratedStory(result.story);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate a story.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedStory) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(generatedStory);
    toast({ title: 'Story copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic-input">Story Topic / Prompt</Label>
        <Input
          id="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., A detective who can talk to ghosts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre-select">Genre</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger id="genre-select">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fantasy">Fantasy</SelectItem>
            <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
            <SelectItem value="Mystery">Mystery</SelectItem>
            <SelectItem value="Horror">Horror</SelectItem>
            <SelectItem value="Adventure">Adventure</SelectItem>
            <SelectItem value="Romance">Romance</SelectItem>
            <SelectItem value="Comedy">Comedy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Story
      </Button>

      {(generatedStory || isLoading) && (
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <Label>Generated Story</Label>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedStory}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <Card className="mt-2">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">{generatedStory}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
