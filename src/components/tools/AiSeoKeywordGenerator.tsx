'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, Key, Users, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { aiSeoKeywordGenerator, type AiSeoKeywordGeneratorOutput } from '@/ai/flows/ai-seo-keyword-generator';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

const KeywordDisplayCard = ({ title, keywords, onCopy }: { title: string; keywords: string[] | undefined; onCopy: (text: string) => void }) => {
    if (!keywords || keywords.length === 0) {
        return null;
    }

    const keywordsText = keywords.join(', ');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onCopy(keywordsText)}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export function AiSeoKeywordGenerator() {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedKeywords, setGeneratedKeywords] = useState<AiSeoKeywordGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Topic is required', description: 'Please enter a topic to get keywords.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    setGeneratedKeywords(null);
    try {
      const result = await aiSeoKeywordGenerator({ 
          topic, 
          targetAudience: targetAudience || 'general audience'
      });
      setGeneratedKeywords(result);
    } catch (error: any) {
      toast({ title: 'Generation Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Keywords copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="topic-input">Topic</Label>
                <Input
                id="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., digital marketing trends"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="audience-input">Target Audience (Optional)</Label>
                <Input
                id="audience-input"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., small business owners"
                />
            </div>
        </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Keywords
      </Button>

      {(isLoading || generatedKeywords) && (
        <div className="pt-4 border-t space-y-4">
            {isLoading ? (
                <>
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-32 w-full" />
                </>
            ) : (
                <>
                <KeywordDisplayCard title="Primary Keywords" keywords={generatedKeywords?.primaryKeywords} onCopy={handleCopy} />
                <KeywordDisplayCard title="Secondary Keywords" keywords={generatedKeywords?.secondaryKeywords} onCopy={handleCopy} />
                <KeywordDisplayCard title="Long-Tail Keywords" keywords={generatedKeywords?.longTailKeywords} onCopy={handleCopy} />
                </>
            )}
        </div>
      )}
    </div>
  );
}

    