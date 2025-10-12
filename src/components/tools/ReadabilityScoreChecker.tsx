
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { BookOpen, Search, Trash2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

// Helper function to count syllables in a word (heuristic)
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-blue-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
}

const getGradeLevel = (score: number): string => {
    if (score >= 90) return "5th Grade";
    if (score >= 80) return "6th Grade";
    if (score >= 70) return "7th Grade";
    if (score >= 60) return "8th & 9th Grade";
    if (score >= 50) return "10th to 12th Grade";
    if (score >= 30) return "College";
    return "College Graduate";
};

const getInterpretation = (score: number): string => {
    if (score >= 90) return "Very easy to read. Easily understood by an average 11-year-old student.";
    if (score >= 80) return "Easy to read. Conversational English for consumers.";
    if (score >= 70) return "Fairly easy to read.";
    if (score >= 60) return "Plain English. Easily understood by 13- to 15-year-old students.";
    if (score >= 50) return "Fairly difficult to read.";
    if (score >= 30) return "Difficult to read.";
    return "Very difficult to read. Best understood by university graduates.";
};

export function ReadabilityScoreChecker() {
    const [text, setText] = useState('');
    const [result, setResult] = useState<{
        score: number,
        wordCount: number,
        sentenceCount: number,
        syllableCount: number
    } | null>(null);

    const handleAnalyze = () => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const wordCount = words.length;
        const sentenceCount = sentences.length;
        
        if (wordCount === 0 || sentenceCount === 0) {
            setResult(null);
            return;
        }

        const syllableCount = words.reduce((acc, word) => acc + countSyllables(word), 0);
        
        const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

        setResult({
            score: Math.max(0, Math.min(100, score)), // Cap score between 0 and 100
            wordCount,
            sentenceCount,
            syllableCount
        });
    };

    const handleClear = () => {
        setText('');
        setResult(null);
    };

    return (
        <div className="space-y-6">
            <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your text here to analyze its readability..."
                className="min-h-[250px]"
            />
            <div className="flex gap-2">
                <Button onClick={handleAnalyze} className="w-full">
                    <Search className="mr-2 h-4 w-4"/> Analyze Readability
                </Button>
                <Button variant="destructive" onClick={handleClear} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear
                </Button>
            </div>
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen/> Readability Analysis</CardTitle>
                        <CardDescription>Based on the Flesch-Kincaid reading ease formula.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Words</p>
                                <p className="text-2xl font-bold">{result.wordCount}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Sentences</p>
                                <p className="text-2xl font-bold">{result.sentenceCount}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Syllables</p>
                                <p className="text-2xl font-bold">{result.syllableCount}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Grade Level</p>
                                <p className="text-2xl font-bold">{getGradeLevel(result.score)}</p>
                            </div>
                        </div>

                         <div className="space-y-2 text-center pt-4">
                            <Label>Readability Score: {result.score.toFixed(1)} / 100</Label>
                            <Progress value={result.score} indicatorClassName={getScoreColor(result.score)} />
                            <p className="text-sm text-muted-foreground pt-2">{getInterpretation(result.score)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
