
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const romanMap: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };

export function RomanToNumberConverter() {
    const [romanInput, setRomanInput] = useState('MMXXIV');
    const [numberOutput, setNumberOutput] = useState('');

    useEffect(() => {
        const roman = romanInput.toUpperCase();
        if (roman.length === 0) {
             setNumberOutput('');
             return;
        }
        let num = 0;
        let i = 0;
        while (i < roman.length) {
            if (i + 1 < roman.length && romanMap[roman.substring(i, i + 2)]) {
                num += romanMap[roman.substring(i, i + 2)];
                i += 2;
            } else if (romanMap[roman.charAt(i)]) {
                num += romanMap[roman.charAt(i)];
                i += 1;
            } else {
                setNumberOutput('Invalid');
                return;
            }
        }
         setNumberOutput(String(num));
    }, [romanInput]);

    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="space-y-2">
                    <Label htmlFor="roman-input">Roman Numeral</Label>
                    <Input id="roman-input" value={romanInput} onChange={e => setRomanInput(e.target.value)} placeholder="e.g., MMXXIV" className="uppercase"/>
                </div>
                <ArrowRightLeft className="mx-auto my-4 md:my-0 text-muted-foreground"/>
                 <div className="space-y-2">
                    <Label htmlFor="number-output">Number</Label>
                    <Input id="number-output" value={numberOutput} readOnly placeholder="e.g., 2024" className="bg-muted"/>
                </div>
            </CardContent>
        </Card>
    );
}
