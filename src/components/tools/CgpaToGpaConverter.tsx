
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const scaleOptions = [
    { value: '10', label: '10-Point Scale' },
    { value: '5', label: '5-Point Scale' },
    { value: '4', label: '4-Point Scale' },
];

const ConverterCard = ({ title, value, onValueChange, scale, onScaleChange, isReadOnly = false }: { title: string, value: string, onValueChange: (val: string) => void, scale: string, onScaleChange: (val: string) => void, isReadOnly?: boolean }) => {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Value</Label>
                    <Input 
                        type="number"
                        value={value}
                        onChange={(e) => onValueChange(e.target.value)}
                        readOnly={isReadOnly}
                        className={isReadOnly ? 'bg-muted font-bold' : ''}
                        placeholder={isReadOnly ? "Result" : "Enter value"}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Scale</Label>
                    <Select value={scale} onValueChange={onScaleChange}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {scaleOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}

export function CgpaToGpaConverter() {
    const [fromValue, setFromValue] = useState('8.5');
    const [fromScale, setFromScale] = useState('10');
    const [toValue, setToValue] = useState('');
    const [toScale, setToScale] = useState('4');
    const { toast } = useToast();

    const handleConvert = () => {
        const fromVal = parseFloat(fromValue);
        const fromScaleVal = parseFloat(fromScale);
        const toScaleVal = parseFloat(toScale);

        if (isNaN(fromVal) || isNaN(fromScaleVal) || isNaN(toScaleVal) || fromVal < 0 || fromScaleVal <= 0 || toScaleVal <= 0) {
            toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive' });
            return;
        }

        if (fromVal > fromScaleVal) {
            toast({ title: 'Invalid Value', description: 'Input value cannot be greater than its scale.', variant: 'destructive' });
            return;
        }

        const calculatedValue = (fromVal / fromScaleVal) * toScaleVal;
        setToValue(calculatedValue.toFixed(2));
    };

    const handleSwap = () => {
        setFromValue(toValue);
        setToValue(fromValue);
        setFromScale(toScale);
        setToScale(fromScale);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <ConverterCard 
                    title="From"
                    value={fromValue}
                    onValueChange={setFromValue}
                    scale={fromScale}
                    onScaleChange={setFromScale}
                />
                
                <Button variant="outline" size="icon" onClick={handleSwap} className="shrink-0">
                    <ArrowRightLeft className="h-5 w-5"/>
                </Button>
                
                <ConverterCard
                    title="To"
                    value={toValue}
                    onValueChange={setToValue}
                    scale={toScale}
                    onScaleChange={setToScale}
                    isReadOnly={true}
                />
            </div>
            <Button onClick={handleConvert} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4" /> Convert
            </Button>
        </div>
    );
}
