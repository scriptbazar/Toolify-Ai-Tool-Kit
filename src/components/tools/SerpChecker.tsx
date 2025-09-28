'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Globe, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { countries } from '@/lib/countries';
import { Combobox } from '../ui/combobox';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getSerpResults, type SerpResult } from '@/ai/flows/serp-checker';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export function SerpChecker() {
    const [keyword, setKeyword] = useState('');
    const [domain, setDomain] = useState('');
    const [country, setCountry] = useState('US');
    const [results, setResults] = useState<SerpResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheck = async () => {
        if (!keyword.trim()) {
            toast({ title: "Keyword is required", description: "Please enter a keyword to check rankings.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setResults([]);

        try {
            const serpData = await getSerpResults({ keyword, country, domain });
            setResults(serpData);
        } catch (error: any) {
             toast({ title: "Error", description: error.message || "Failed to fetch SERP results.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="keyword">Keyword</Label>
                    <Input id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g., best seo tools" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="domain">Your Domain (Optional)</Label>
                    <Input id="domain" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g., yoursite.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Combobox
                        items={countries.map(c => ({ value: c.code, label: `${c.flag} ${c.name}`}))}
                        value={country}
                        onValueChange={setCountry}
                        placeholder="Select country"
                        searchPlaceholder="Search country..."
                        notFoundMessage="No country found"
                    />
                </div>
            </div>
            <Button onClick={handleCheck} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>} 
                Check Rankings
            </Button>
            
            {(isLoading || results.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Search Results</CardTitle>
                        <CardDescription>Showing results for "{keyword}" in {countries.find(c => c.code === country)?.name || country}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-3/4 mb-2" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    results.map(res => (
                                        <TableRow key={res.position} className={res.url.includes(domain) && domain ? 'bg-primary/10' : ''}>
                                            <TableCell className="font-bold text-lg">{res.position}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">{res.title}</p>
                                                    {res.url.includes(domain) && domain && <Badge>Your Domain</Badge>}
                                                </div>
                                                <Link href={res.url} target="_blank" className="flex items-center gap-1 text-xs text-green-700 dark:text-green-500 truncate group">
                                                    <LinkIcon className="h-3 w-3"/>
                                                    {res.url}
                                                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-1">{res.snippet}</p>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
