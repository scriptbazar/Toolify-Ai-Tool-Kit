
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiTweetGenerator } from '@/ai/flows/ai-tweet-generator';

export function AiTweetGenerator() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Informative');
  const [generatedTweet, setGeneratedTweet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic to generate a tweet.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedTweet('');
    try {
      const result = await aiTweetGenerator({ topic, tone: tone as any });
      setGeneratedTweet(result.tweet);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate a tweet.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedTweet) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(generatedTweet);
    toast({ title: 'Tweet copied to clipboard!' });
  };
  
  const handlePostToTwitter = () => {
    if (!generatedTweet) {
      toast({ title: 'Nothing to post!', variant: 'destructive' });
      return;
    }
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedTweet)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="topic-input">Tweet Topic / Prompt</Label>
            <Input
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The importance of AI in modern web development"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="tone-select">Tone of Voice</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone-select">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Witty">Witty</SelectItem>
                <SelectItem value="Informative">Informative</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Tweet
      </Button>

      {(generatedTweet || isLoading) && (
        <div className="pt-4 border-t">
          <Label>Generated Tweet</Label>
          <Card className="mt-2">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">{generatedTweet}</p>
              )}
            </CardContent>
          </Card>
           <div className="flex gap-2 mt-4">
             <Button variant="outline" onClick={handleCopy} disabled={!generatedTweet} className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy Tweet
            </Button>
            <Button onClick={handlePostToTwitter} disabled={!generatedTweet} className="flex-1">
              <Twitter className="mr-2 h-4 w-4" />
              Post on X
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
