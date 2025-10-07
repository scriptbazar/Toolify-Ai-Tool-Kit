
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { analyzeUrl } from '@/ai/flows/website-analyzer';
import { useToast } from '@/hooks/use-toast';

export function WebsiteWordCounter() {
    const [url, setUrl] = useState('');
    const [wordCount, setWordCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCount = async () => {
        if (!url.trim()) {
            toast({ title: 'URL is required', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setWordCount(null);
        try {
            const result = await analyzeUrl({ url, analysisType: 'word-count' });
            if (result.wordCount !== undefined) {
                setWordCount(result.wordCount);
            } else if (result.error) {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
                <Button onClick={handleCount} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Calculator className="mr-2 h-4 w-4"/>} 
                    Count Words
                </Button>
            </div>
             {wordCount !== null && (
                <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle>Word Count Result</CardTitle>
                        <CardDescription>Estimated word count for the given URL.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{wordCount.toLocaleString()}</p>
                        <p className="text-xl text-muted-foreground">Words</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
