
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const romanMap: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
const numberMap: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

export function NumberToRomanConverter() {
    const [numberInput, setNumberInput] = useState('2024');
    const [romanInput, setRomanInput] = useState('');

    useEffect(() => {
        if (document.activeElement?.id === 'number-input') {
            const num = parseInt(numberInput, 10);
            if (!isNaN(num) && num > 0 && num < 4000) {
                let roman = '';
                let currentNum = num;
                for (const [n, r] of numberMap) {
                    while (currentNum >= n) {
                        roman += r;
                        currentNum -= n;
                    }
                }
                setRomanInput(roman);
            } else if (numberInput === '') {
                 setRomanInput('');
            }
        }
    }, [numberInput]);

    useEffect(() => {
         if (document.activeElement?.id === 'roman-input') {
            const roman = romanInput.toUpperCase();
            if (roman.length === 0) {
                 setNumberInput('');
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
                    setNumberInput('Invalid');
                    return;
                }
            }
             setNumberInput(String(num));
        }
    }, [romanInput]);

    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="space-y-2">
                    <Label htmlFor="number-input">Number</Label>
                    <Input id="number-input" value={numberInput} onChange={e => setNumberInput(e.target.value)} placeholder="e.g., 2024"/>
                </div>
                <ArrowRightLeft className="mx-auto my-4 md:my-0 text-muted-foreground"/>
                 <div className="space-y-2">
                    <Label htmlFor="roman-input">Roman Numeral</Label>
                    <Input id="roman-input" value={romanInput} onChange={e => setRomanInput(e.target.value)} placeholder="e.g., MMXXIV" className="uppercase"/>
                </div>
            </CardContent>
        </Card>
    );
}
