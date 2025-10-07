
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { analyzeUrl } from '@/ai/flows/website-analyzer';
import { useToast } from '@/hooks/use-toast';

interface RedirectResult {
    url: string;
    status: number;
    redirectChain: { url: string, status: number }[];
    error?: string;
}

export function RedirectChecker() {
    const [urls, setUrls] = useState('');
    const [results, setResults] = useState<RedirectResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheck = async () => {
        const urlList = urls.split('\n').filter(u => u.trim() !== '');
        if (urlList.length === 0) {
            toast({ title: "No URLs provided", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setResults([]);
        
        const newResults: RedirectResult[] = [];
        for (const url of urlList) {
            try {
                const result = await analyzeUrl({ url, analysisType: 'redirect' });
                if (result.redirectChain) {
                    newResults.push({
                        url,
                        status: result.redirectChain[result.redirectChain.length - 1].status,
                        redirectChain: result.redirectChain,
                    });
                } else if (result.error) {
                    throw new Error(result.error);
                }
            } catch (error: any) {
                 newResults.push({ url, status: 0, redirectChain: [], error: error.message });
            }
        }
        setResults(newResults);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <Textarea value={urls} onChange={e => setUrls(e.target.value)} placeholder="Enter one URL per line..." className="min-h-[150px]" />
            <Button onClick={handleCheck} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>} 
                Check Redirects
            </Button>

            {(isLoading || results.length > 0) && (
                <Card>
                    <CardHeader><CardTitle>Redirect Results</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading && <p>Checking URLs, please wait...</p>}
                        {results.map((res, i) => (
                            <Alert key={i} variant={res.error ? 'destructive' : (res.status === 200 ? 'default' : 'destructive')}>
                                {res.error ? <XCircle className="h-4 w-4"/> : <CheckCircle className="h-4 w-4"/>}
                                <AlertTitle className="truncate">{res.url}</AlertTitle>
                                <AlertDescription>
                                    {res.error ? (
                                        <p>{res.error}</p>
                                    ) : (
                                        <>
                                            <p><strong>Final Status:</strong> {res.status}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {res.redirectChain.map((step, j) => (
                                                    <span key={j} className="flex items-center gap-2 text-xs">
                                                        <span className="truncate max-w-[200px]">{step.url}</span>
                                                        <span className="font-bold">({step.status})</span>
                                                        {j < res.redirectChain.length - 1 && <ArrowRight className="h-3 w-3"/>}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
