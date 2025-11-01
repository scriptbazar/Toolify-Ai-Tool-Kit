
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
import { cn } from '@/lib/utils';

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
    const [analyzed, setAnalyzed] = useState(false);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const wordSet = useMemo(() => new Set(wordList), []);
    const { toast } = useToast();

    const handleAnalyze = () => {
        const words = text.split(/([^a-zA-Z']+)/); // Split by non-alphabetic characters, keeping them
        const misspelled = new Map<number, {word: string, suggestions: string[]}>();
        let wordIndexCounter = 0;
        
        words.forEach((word) => {
            if (/[a-zA-Z']+/.test(word)) { // Check if it's a word
                const lowerWord = word.toLowerCase();
                if (!wordSet.has(lowerWord)) {
                    const suggestions = wordList
                        .map(dictWord => ({
                            word: dictWord,
                            distance: levenshteinDistance(lowerWord, dictWord),
                        }))
                        .sort((a, b) => a.distance - b.distance)
                        .slice(0, 5) // Get top 5 suggestions
                        .map(item => item.word);

                    misspelled.set(wordIndexCounter, {word, suggestions});
                }
                wordIndexCounter++;
            }
        });
        setMisspelledWords(misspelled);
        setAnalyzed(true);
    };
    
    const handleCorrection = (wordIndex: number, newWord: string) => {
        const wordsAndSeparators = text.split(/(\s+)/);
        let currentWordIndex = -1;
        
        const newWords = wordsAndSeparators.map(part => {
            if (/\S+/.test(part)) {
                currentWordIndex++;
                if (currentWordIndex === wordIndex) {
                    const originalWord = misspelledWords.get(wordIndex)?.word;
                    if (originalWord) {
                        const punctuation = originalWord.match(/[^a-zA-Z']$/);
                        const newWordWithPunctuation = punctuation ? newWord + punctuation[0] : newWord;

                        if (originalWord === originalWord.toUpperCase()) {
                            return newWordWithPunctuation.toUpperCase();
                        }
                        if (originalWord[0] === originalWord[0].toUpperCase()) {
                            return newWordWithPunctuation.charAt(0).toUpperCase() + newWordWithPunctuation.slice(1);
                        }
                        return newWordWithPunctuation;
                    }
                    return newWord;
                }
            }
            return part;
        });

        const newText = newWords.join('');
        setText(newText);
        setOpenPopover(null); // Close popover after correction
        
        // Re-analyze after correction
        handleAnalyze(); 
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast({ title: "Text copied to clipboard!" });
    }
    
    const handleClear = () => {
        setText('');
        setMisspelledWords(new Map());
        setAnalyzed(false);
    };

    const renderTextWithHighlights = () => {
        if (!text) return <p className="text-muted-foreground">The analyzed text will appear here.</p>;
        
        const parts = text.split(/([a-zA-Z']+)/);
        let wordIndexCounter = -1;

        return parts.map((part, index) => {
            if (/[a-zA-Z']+/.test(part)) { // It's a word
                wordIndexCounter++;
                if (misspelledWords.has(wordIndexCounter)) {
                    const data = misspelledWords.get(wordIndexCounter);
                    const popoverId = `popover-${wordIndexCounter}`;
                    return (
                        <Popover key={`${wordIndexCounter}-${data?.word}`} open={openPopover === popoverId} onOpenChange={(open) => setOpenPopover(open ? popoverId : null)}>
                            <PopoverTrigger asChild>
                                <span className="bg-red-500/20 text-red-700 dark:text-red-300 rounded-sm px-1 cursor-pointer underline decoration-wavy decoration-red-500">
                                    {part}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                               <div className="flex flex-col gap-1">
                                 <p className="text-xs text-muted-foreground px-2 font-semibold">Suggestions:</p>
                                 {data?.suggestions.map(suggestion => (
                                     <Button key={suggestion} variant="ghost" size="sm" className="justify-start h-8" onClick={() => handleCorrection(wordIndexCounter, suggestion)}>
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
                onChange={e => {
                    setText(e.target.value);
                    setAnalyzed(false); // Reset analysis on text change
                    setMisspelledWords(new Map());
                }}
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
                <Button variant="destructive" onClick={handleClear} disabled={!text} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Text
                </Button>
            </div>
            {analyzed && (
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
        </div>
    );
}
