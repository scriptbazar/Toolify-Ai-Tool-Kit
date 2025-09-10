
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Twitter, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiTweetGenerator } from '@/ai/flows/ai-tweet-generator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

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
  
  const characterCount = generatedTweet.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tweet Idea</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
            </Card>
             <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Tweet
            </Button>
        </div>
       <div className="space-y-4">
            <Label>Generated Tweet Preview</Label>
            <Card className="min-h-[250px]">
                <CardContent className="p-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Avatar><AvatarFallback><User /></AvatarFallback></Avatar>
                        <div className="flex-1">
                            <div className="font-bold">You</div>
                            <p className="text-foreground whitespace-pre-wrap">{generatedTweet || 'Your generated tweet will appear here...'}</p>
                            {generatedTweet && (
                                <div className={cn("text-sm mt-4 text-right", characterCount > 280 ? 'text-red-500' : 'text-muted-foreground')}>
                                    {characterCount}/280
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
            <div className="flex gap-2">
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
    </div>
  );
}
