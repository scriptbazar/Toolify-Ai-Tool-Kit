
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

type DensityResult = { keyword: string; count: number; density: string; };

export function KeywordDensityChecker() {
    const [text, setText] = useState('');
    const [oneWordDensity, setOneWordDensity] = useState<DensityResult[]>([]);
    const [twoWordDensity, setTwoWordDensity] = useState<DensityResult[]>([]);
    const [threeWordDensity, setThreeWordDensity] = useState<DensityResult[]>([]);
    
    const stopWords = useMemo(() => new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'am', 'are', 'was', 'were', 'it', 'i', 'you', 'he', 'she', 'they', 'we']), []);

    const calculateDensity = () => {
        const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
        const filteredWords = words.filter(word => !stopWords.has(word));
        const totalWords = filteredWords.length;
        if (totalWords === 0) return;

        const getDensity = (wordList: string[]) => {
            const counts: { [key: string]: number } = {};
            wordList.forEach(word => {
                counts[word] = (counts[word] || 0) + 1;
            });
            return Object.entries(counts)
                .map(([keyword, count]) => ({ keyword, count, density: ((count / totalWords) * 100).toFixed(2) + '%' }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
        };

        setOneWordDensity(getDensity(filteredWords));

        const twoWordPhrases = [];
        for (let i = 0; i < filteredWords.length - 1; i++) {
            twoWordPhrases.push(`${filteredWords[i]} ${filteredWords[i+1]}`);
        }
        setTwoWordDensity(getDensity(twoWordPhrases));

        const threeWordPhrases = [];
        for (let i = 0; i < filteredWords.length - 2; i++) {
            threeWordPhrases.push(`${filteredWords[i]} ${filteredWords[i+1]} ${filteredWords[i+2]}`);
        }
        setThreeWordDensity(getDensity(threeWordPhrases));
    };

    const renderTable = (title: string, data: DensityResult[]) => (
        <Card>
            <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Keyword</TableHead><TableHead>Count</TableHead><TableHead>Density</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.keyword}><TableCell>{item.keyword}</TableCell><TableCell>{item.count}</TableCell><TableCell>{item.density}</TableCell></TableRow>
                        ))}
                         {data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your text content here..." className="min-h-[200px]" />
            <Button onClick={calculateDensity} className="w-full"><Search className="mr-2 h-4 w-4"/> Analyze Text</Button>
            {oneWordDensity.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {renderTable('1-Word Keywords', oneWordDensity)}
                    {renderTable('2-Word Keywords', twoWordDensity)}
                    {renderTable('3-Word Keywords', threeWordDensity)}
                </div>
            )}
        </div>
    );
}
