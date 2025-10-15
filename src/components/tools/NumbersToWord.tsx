
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, CaseUpper, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

const indianScales = ['', 'Thousand', 'Lakh', 'Crore'];

function numberToWordsUSD(num: number): string {
    if (num === 0) return 'Zero';
    let words = '';
    let i = 0;

    do {
        let n = num % 1000;
        if (n !== 0) {
            let str = convertThreeDigit(n);
            words = str + ' ' + scales[i] + ' ' + words;
        }
        num = Math.floor(num / 1000);
        i++;
    } while (num > 0);

    return words.trim();
}

function convertThreeDigit(num: number): string {
    let str = '';
    if (num >= 100) {
        str += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }
    if (num >= 10 && num <= 19) {
        str += teens[num - 10] + ' ';
    } else if (num >= 20) {
        str += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    }
    if (num > 0 && num < 10) {
        str += ones[num] + ' ';
    }
    return str;
}


function numberToWordsINR(num: number): string {
    if (num === 0) return 'Zero';
    let words = '';
    
    if (num >= 10000000) {
        words += numberToWordsINR(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }
    if (num >= 100000) {
        words += numberToWordsINR(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }
    if (num >= 1000) {
        words += numberToWordsINR(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }
    if (num >= 100) {
        words += numberToWordsINR(Math.floor(num / 100)) + ' Hundred ';
        num %= 100;
    }
    if (num > 0) {
        if (words !== "") words += 'and ';
        if (num < 20) {
            words += [...ones, ...teens][num];
        } else {
            words += tens[Math.floor(num / 10)];
            if (num % 10 > 0) {
                words += ' ' + ones[num % 10];
            }
        }
    }

    return words.trim();
}


export function NumbersToWord() {
    const [numberInput, setNumberInput] = useState('');
    const [wordOutput, setWordOutput] = useState('');
    const [format, setFormat] = useState('USD');
    const { toast } = useToast();

    useEffect(() => {
        convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberInput, format]);

    const convert = () => {
        if (!numberInput.trim()) {
            setWordOutput('');
            return;
        }
        const num = parseInt(numberInput.replace(/,/g, ''), 10);
        if (isNaN(num)) {
            setWordOutput('Invalid number');
            return;
        }
        
        let result = '';
        if (format === 'USD') {
            result = numberToWordsUSD(num);
        } else { // INR
            result = numberToWordsINR(num);
        }
        setWordOutput(result);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(wordOutput);
        toast({ title: 'Copied to clipboard!' });
    };
    
     const handleClear = () => {
        setNumberInput('');
        setWordOutput('');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Number to Word Converter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="number-input">Enter Number</Label>
                            <Input id="number-input" value={numberInput} onChange={e => setNumberInput(e.target.value)} placeholder="e.g., 12345"/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="format-select">Format</Label>
                             <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger id="format-select"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">International (Million, Billion)</SelectItem>
                                    <SelectItem value="INR">Indian (Lakh, Crore)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Result
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!wordOutput}><Copy className="h-4 w-4"/></Button>
                            <Button variant="destructive" size="icon" onClick={handleClear} disabled={!numberInput && !wordOutput}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-muted rounded-md min-h-[100px]">
                    <p className="text-lg font-semibold">{wordOutput}</p>
                </CardContent>
            </Card>
        </div>
    );
}
