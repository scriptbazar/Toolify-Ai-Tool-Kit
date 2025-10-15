
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
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

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
        const wordsAndSeparators = text.split(/(\s+)/);
        let currentWordIndex = -1;
        
        const newWords = wordsAndSeparators.map(part => {
            if (/\S+/.test(part)) { // Check if it's a word and not just whitespace
                currentWordIndex++;
                if (currentWordIndex === wordIndex) {
                    // Preserve original capitalization if possible
                    const originalWord = misspelledWords.get(wordIndex)?.word;
                    if (originalWord) {
                        if (originalWord === originalWord.toUpperCase()) {
                            return newWord.toUpperCase();
                        }
                        if (originalWord[0] === originalWord[0].toUpperCase()) {
                            return newWord.charAt(0).toUpperCase() + newWord.slice(1);
                        }
                    }
                    return newWord;
                }
            }
            return part;
        });

        const newText = newWords.join('');
        setText(newText);
        
        // Re-analyze after correction to update the UI
        const updatedWords = newText.match(/\b[\w']+\b/g) || [];
        const updatedMisspelled = new Map<number, {word: string, suggestions: string[]}>();
        updatedWords.forEach((word, index) => {
            if (!wordSet.has(word.toLowerCase())) {
                const suggestions = wordList.map(dictWord => ({ word: dictWord, distance: levenshteinDistance(word.toLowerCase(), dictWord) })).sort((a, b) => a.distance - b.distance).slice(0, 3).map(item => item.word);
                updatedMisspelled.set(index, { word, suggestions });
            }
        });
        setMisspelledWords(updatedMisspelled);
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast({ title: "Text copied to clipboard!" });
    }

    const renderTextWithHighlights = () => {
        if (!text) return <p className="text-muted-foreground">The analyzed text will appear here.</p>;
        
        const wordsAndSeparators = text.split(/(\s+)/);
        let wordIndex = -1;

        return wordsAndSeparators.map((part, index) => {
            if (/\S+/.test(part)) {
                wordIndex++;
                if (misspelledWords.has(wordIndex)) {
                    const data = misspelledWords.get(wordIndex);
                    return (
                        <Popover key={`${wordIndex}-${data?.word}`}>
                            <PopoverTrigger asChild>
                                <span className="bg-red-500/20 text-red-700 dark:text-red-300 rounded-sm px-1 cursor-pointer underline decoration-wavy decoration-red-500">
                                    {part}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                               <div className="flex flex-col gap-1">
                                 <p className="text-xs text-muted-foreground px-2 font-semibold">Suggestions:</p>
                                 {data?.suggestions.map(suggestion => (
                                     <Button key={suggestion} variant="ghost" size="sm" className="justify-start h-8" onClick={() => handleCorrection(wordIndex, suggestion)}>
                                        {suggestion}
                                     </Button>
                                 ))}
                                 {data?.suggestions.length === 0 && <p className="text-xs p-2 text-muted-foreground">No suggestions found.</p>}
                               </div>
                            </PopoverContent>
                        </Popover>
                    );
                }
            }
            return <span key={index}>{part}</span>;
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
                    <CardContent className="p-4 border rounded-md bg-muted min-h-[200px] text-base leading-relaxed whitespace-pre-wrap">
                        {renderTextWithHighlights()}
                    </CardContent>
                </Card>
            )}
             {text && misspelledWords.size === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-600">No spelling errors found!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
