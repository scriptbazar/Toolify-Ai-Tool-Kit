
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Link, FileText, Lightbulb, Users, BarChart2, CheckCircle, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { summarizeAndExplainWebContent, type AiWebContentSummarizerOutput } from '@/ai/flows/ai-web-content-summarizer';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

const InfoCard = ({ title, content, icon: Icon }: { title: string; content: string; icon: React.ElementType }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5"/>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{content}</p>
        </CardContent>
    </Card>
);

const ListCard = ({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ElementType }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0"/>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

const KeywordCard = ({ title, keywords, icon: Icon }: { title: string; keywords: string[]; icon: React.ElementType }) => (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5"/>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => <Badge key={i} variant="secondary">{kw}</Badge>)}
            </div>
        </CardContent>
    </Card>
)

export function AiWebContentSummarizer() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AiWebContentSummarizerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProcessUrl = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL is required',
        description: 'Please enter a URL to process.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
        new URL(url);
    } catch (_) {
        toast({ title: 'Invalid URL', description: 'Please enter a valid URL (e.g., https://example.com).', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await summarizeAndExplainWebContent({ url });
      setResult(response);
    } catch (error: any) {
      toast({
        title: 'Processing Failed',
        description: error.message || 'Could not process the content from the URL.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderLoadingState = () => (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="h-12"
        />
        <Button onClick={handleProcessUrl} disabled={isLoading} className="h-12">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Analyze URL
        </Button>
      </div>
      
      {(isLoading || result) && (
        <div className="pt-6 border-t">
          {isLoading ? renderLoadingState() : result && (
            <div className="space-y-6">
                <Card className="bg-primary/5 border-primary">
                    <CardHeader><CardTitle>Overall Summary</CardTitle></CardHeader>
                    <CardContent><p>{result.summary}</p></CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <InfoCard title="Target Audience" content={result.targetAudience} icon={Users} />
                   <InfoCard title="Tone of Voice" content={result.toneOfVoice} icon={BarChart2} />
                   <InfoCard title="Final Verdict" content={result.finalVerdict} icon={CheckCircle} />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ListCard title="Core Concepts" items={result.coreConcepts} icon={BrainCircuit} />
                    <ListCard title="Key Takeaways" items={result.keyTakeaways} icon={Lightbulb} />
                </div>
                 <Card>
                    <CardHeader><CardTitle>SEO Analysis</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KeywordCard title="Primary Keywords" keywords={result.seoAnalysis.primaryKeywords} icon={FileText} />
                        <KeywordCard title="LSI Keywords" keywords={result.seoAnalysis.lsiKeywords} icon={FileText} />
                    </CardContent>
                 </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
