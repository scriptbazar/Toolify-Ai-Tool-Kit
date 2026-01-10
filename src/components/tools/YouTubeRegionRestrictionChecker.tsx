

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Youtube, Globe, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { getVideoDetails } from '@/ai/flows/youtube-data';
import { getVideoId } from '@/lib/youtube-utils';

export function YouTubeRegionRestrictionChecker() {
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<{ title: string; blocked: string[]; allowed?: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleCheck = async () => {
        const videoId = getVideoId(url);
        if (!videoId) {
            toast({ title: 'Invalid YouTube URL', description: 'Please enter a valid YouTube video URL.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setResults(null);
        setError(null);
        
        try {
            const data = await getVideoDetails({ videoId });
            if (data.error) {
                throw new Error(data.error);
            }
            
            setResults({
                title: data.title || 'Unknown Title',
                blocked: data.regionRestriction?.blocked || [],
                allowed: data.regionRestriction?.allowed || [],
            });

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            toast({
                title: 'Check Failed',
                description: e.message || 'Please check the URL and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="youtube-url" className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600"/>
                    YouTube Video URL
                </Label>
                <div className="flex gap-2">
                    <Input 
                        id="youtube-url"
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                    />
                    <Button onClick={handleCheck} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                        Check Restrictions
                    </Button>
                </div>
            </div>
            
            {(isLoading || results || error) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Restriction Report</CardTitle>
                        <CardDescription>
                            {isLoading ? 'Checking for restrictions...' : `Results for: ${results?.title || 'the provided URL'}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : error ? (
                            <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>
                        ) : results && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                    <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle/>Available In</h3>
                                      {results.allowed && results.allowed.length > 0 ? (
                                        <ScrollArea className="h-24 mt-2">
                                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                               {results.allowed.map(country => <li key={country}>{country}</li>)}
                                            </ul>
                                        </ScrollArea>
                                     ) : (
                                         <p className="text-sm text-muted-foreground mt-1">This video appears to be available worldwide.</p>
                                     )}
                                </div>
                                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                     <h3 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400"><XCircle/>Blocked In</h3>
                                      {results.blocked.length > 0 ? (
                                        <ScrollArea className="h-24 mt-2">
                                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                               {results.blocked.map(country => <li key={country}>{country}</li>)}
                                            </ul>
                                        </ScrollArea>
                                     ) : (
                                         <p className="text-sm text-muted-foreground mt-1">No specific country blocks detected.</p>
                                     )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
