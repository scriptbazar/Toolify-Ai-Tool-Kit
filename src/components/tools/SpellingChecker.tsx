
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Search, Copy, Trash2 } from 'lucide-react';
import { wordList } from '@/lib/word-list';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Levenshtein distance function to find closest words for suggestions
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[j][0] = j;
  }
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};


export function SpellingChecker() {
    const [text, setText] = useState('');
    const [misspelledWords, setMisspelledWords] = useState<Map<number, {word: string, suggestions: string[]}>>(new Map());
    const wordSet = useMemo(() => new Set(wordList), []);

    const handleAnalyze = () => {
        const words = text.match(/\b[\w']+\b/g) || [];
        const misspelled = new Map<number, {word: string, suggestions: string[]}>();
        
        words.forEach((word, index) => {
            const lowerWord = word.toLowerCase();
            if (!wordSet.has(lowerWord)) {
                 // Find suggestions
                const suggestions = wordList
                    .map(dictWord => ({
                        word: dictWord,
                        distance: levenshteinDistance(lowerWord, dictWord),
                    }))
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 3)
                    .map(item => item.word);

                misspelled.set(index, {word, suggestions});
            }
        });
        setMisspelledWords(misspelled);
    };
    
    const handleCorrection = (wordIndex: number, newWord: string) => {
        const words = text.split(/(\s+)/);
        let currentWordIndex = -1;
        
        const newWords = words.map(word => {
            if (/\S+/.test(word)) { // Check if it's a word and not just whitespace
                currentWordIndex++;
                if (currentWordIndex === wordIndex) {
                    return newWord;
                }
            }
            return word;
        });

        setText(newWords.join(''));
        // Re-analyze after correction
        handleAnalyze();
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
    }

    const renderTextWithHighlights = () => {
        if (!text) return null;
        
        const words = text.split(/(\s+)/);
        let wordIndex = -1;

        return words.map((word, index) => {
            if (/\S+/.test(word)) {
                wordIndex++;
                if (misspelledWords.has(wordIndex)) {
                    const data = misspelledWords.get(wordIndex);
                    return (
                        <Popover key={index}>
                            <PopoverTrigger asChild>
                                <span className="bg-red-500/30 text-red-700 dark:text-red-300 rounded-sm px-1 cursor-pointer">{word}</span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                               <div className="flex flex-col gap-1">
                                 <p className="text-xs text-muted-foreground px-2">Suggestions:</p>
                                 {data?.suggestions.map(suggestion => (
                                     <Button key={suggestion} variant="ghost" size="sm" className="justify-start" onClick={() => handleCorrection(wordIndex, suggestion)}>
                                        {suggestion}
                                     </Button>
                                 ))}
                               </div>
                            </PopoverContent>
                        </Popover>
                    );
                }
            }
            return <span key={index}>{word}</span>;
        });
    };

    return (
        <div className="space-y-6">
            <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your text here to check for spelling errors..."
                className="min-h-[250px]"
            />
            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAnalyze} className="w-full">
                    <Search className="mr-2 h-4 w-4"/> Analyze Text
                </Button>
                 <Button variant="outline" onClick={handleCopy} disabled={!text} className="w-full">
                    <Copy className="mr-2 h-4 w-4" /> Copy Corrected Text
                </Button>
                <Button variant="destructive" onClick={() => setText('')} disabled={!text} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Text
                </Button>
            </div>
            {misspelledWords.size > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Result</CardTitle>
                        <CardDescription>
                            Found {misspelledWords.size} potential error(s). Click on a highlighted word to see suggestions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 border rounded-md bg-muted min-h-[200px] text-lg leading-relaxed whitespace-pre-wrap">
                        {renderTextWithHighlights()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
