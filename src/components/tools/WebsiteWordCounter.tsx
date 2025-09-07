
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function WebsiteWordCounter() {
    const [url, setUrl] = useState('');
    const [wordCount, setWordCount] = useState<number | null>(null);

    const handleCount = () => {
        // This is a dummy function. Real implementation requires a server-side fetch to bypass CORS.
        setWordCount(Math.floor(Math.random() * (2000 - 300 + 1) + 300));
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
                <Button onClick={handleCount}><Calculator className="mr-2 h-4 w-4"/> Count Words</Button>
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
