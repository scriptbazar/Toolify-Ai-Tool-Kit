
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export function RedirectChecker() {
    const [urls, setUrls] = useState('');
    const [results, setResults] = useState<{ url: string, status: string, redirectChain: string[] }[]>([]);

    const handleCheck = () => {
        const urlList = urls.split('\n').filter(u => u.trim() !== '');
        // This is a dummy response. A real implementation would make server-side requests.
        const dummyResults = urlList.map(url => ({
            url,
            status: '200 OK',
            redirectChain: ['https://example.com/start -> 301', 'https://www.example.com/final -> 200']
        }));
        setResults(dummyResults);
    };

    return (
        <div className="space-y-6">
            <Textarea value={urls} onChange={e => setUrls(e.target.value)} placeholder="Enter one URL per line..." className="min-h-[150px]" />
            <Button onClick={handleCheck} className="w-full"><Search className="mr-2 h-4 w-4"/> Check Redirects</Button>

            {results.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Redirect Results</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {results.map((res, i) => (
                            <Alert key={i} variant={res.status.startsWith('200') ? 'default' : 'destructive'}>
                                {res.status.startsWith('200') ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4" />}
                                <AlertTitle>{res.url}</AlertTitle>
                                <AlertDescription>
                                    <p><strong>Final Status:</strong> {res.status}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {res.redirectChain.map((step, j) => (
                                            <span key={j} className="flex items-center gap-2 text-xs">{step} {j < res.redirectChain.length - 1 && <ArrowRight className="h-3 w-3"/>}</span>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
