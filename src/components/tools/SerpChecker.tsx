
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { countries } from '@/lib/countries';
import { Combobox } from '../ui/combobox';
import Link from 'next/link';

export function SerpChecker() {
    const [keyword, setKeyword] = useState('');
    const [domain, setDomain] = useState('');
    const [country, setCountry] = useState('US');
    const [results, setResults] = useState<{ position: number; title: string; url: string; }[]>([]);

    const handleCheck = () => {
        // Dummy data for demonstration. A real implementation would use a server-side API.
        const dummyResults = Array.from({ length: 20 }, (_, i) => ({
            position: i + 1,
            title: `Search Result Title #${i + 1} for ${keyword}`,
            url: `https://example.com/page${i+1}`
        }));
        if(domain) {
           dummyResults[5] = { position: 6, title: `Your Awesome Result for ${keyword}`, url: `https://${domain}/your-page` };
        }
        setResults(dummyResults);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="keyword">Keyword</Label>
                    <Input id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g., best seo tools" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="domain">Domain (Optional)</Label>
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
            <Button onClick={handleCheck} className="w-full"><Search className="mr-2 h-4 w-4"/>Check Rankings</Button>
            {results.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Top 20 SERP Results</CardTitle><CardDescription>Showing results for "{keyword}" in {country}</CardDescription></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Title & URL</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {results.map(res => (
                                    <TableRow key={res.position} className={res.url.includes(domain) && domain ? 'bg-primary/10' : ''}>
                                        <TableCell>{res.position}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{res.title}</p>
                                            <Link href={res.url} target="_blank" className="text-xs text-green-600 truncate">{res.url}</Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
