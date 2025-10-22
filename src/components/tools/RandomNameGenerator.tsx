
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { Combobox } from '../ui/combobox';

// Simplified name data for demonstration
const names: { [key: string]: { male: string[], female: string[] } } = {
    'US': { male: ['James', 'John', 'Robert', 'Michael', 'William'], female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth'] },
    'IN': { male: ['Aarav', 'Vihaan', 'Aditya', 'Reyansh', 'Arjun'], female: ['Saanvi', 'Aanya', 'Aadhya', 'Ananya', 'Pari'] },
    'GB': { male: ['Oliver', 'George', 'Harry', 'Noah', 'Jack'], female: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Emily'] },
    'default': { male: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'], female: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'] }
};

export function RandomNameGenerator() {
    const [country, setCountry] = useState('US');
    const [gender, setGender] = useState('male');
    const [count, setCount] = useState(10);
    const [generatedNames, setGeneratedNames] = useState('');
    const { toast } = useToast();

    const handleGenerate = () => {
        const nameList = names[country as keyof typeof names] || names['default'];
        const genderList = nameList[gender as keyof typeof nameList];

        let result = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * genderList.length);
            result.push(genderList[randomIndex]);
        }
        setGeneratedNames(result.join('\n'));
    };

    const handleCopy = () => {
        if (!generatedNames) return;
        navigator.clipboard.writeText(generatedNames);
        toast({ title: "Copied to clipboard!" });
    };

    const handleClear = () => {
        setGeneratedNames('');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Country</Label>
                    <Combobox
                        items={countries.map(c => ({ value: c.code, label: `${c.flag} ${c.name}`}))}
                        value={country}
                        onValueChange={setCountry}
                        placeholder="Select country..."
                        searchPlaceholder="Search country..."
                        notFoundMessage="No country found."
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Number of Names</Label>
                    <Input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} min="1"/>
                </div>
            </div>
            <Button onClick={handleGenerate} className="w-full">
                <Users className="mr-2 h-4 w-4"/> Generate Names
            </Button>
            <div className="space-y-2">
                <Label>Generated Names</Label>
                <Textarea value={generatedNames} readOnly className="min-h-[250px] bg-muted"/>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedNames}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                    <Button variant="destructive" size="sm" onClick={handleClear} disabled={!generatedNames}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
                </div>
            </div>
        </div>
    );
}
