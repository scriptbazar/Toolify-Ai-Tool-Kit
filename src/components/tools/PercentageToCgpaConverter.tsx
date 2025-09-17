
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

export function PercentageToCgpaConverter() {
    const [percentage, setPercentage] = useState('85');
    const [scale, setScale] = useState('10');
    const [cgpa, setCgpa] = useState<string | null>(null);
    const { toast } = useToast();

    const handleConvert = () => {
        const perc = parseFloat(percentage);
        const scaleVal = parseFloat(scale);

        if (isNaN(perc) || perc < 0 || perc > 100) {
            toast({ title: 'Invalid Percentage', description: 'Please enter a percentage between 0 and 100.', variant: 'destructive' });
            return;
        }

        if (isNaN(scaleVal) || scaleVal <= 0) {
            toast({ title: 'Invalid Scale', description: 'Please select a valid CGPA scale.', variant: 'destructive' });
            return;
        }

        const result = (perc / 100) * scaleVal;
        setCgpa(result.toFixed(2));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="percentage-input">Your Percentage (%)</Label>
                    <Input 
                        id="percentage-input" 
                        type="number" 
                        value={percentage} 
                        onChange={(e) => setPercentage(e.target.value)} 
                        placeholder="e.g., 85"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="scale-select">Target CGPA Scale</Label>
                    <Select value={scale} onValueChange={setScale}>
                        <SelectTrigger id="scale-select"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10-Point Scale</SelectItem>
                            <SelectItem value="4">4-Point Scale</SelectItem>
                            <SelectItem value="5">5-Point Scale</SelectItem>
                            <SelectItem value="7">7-Point Scale</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handleConvert} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4" /> Convert to CGPA
            </Button>
            {cgpa !== null && (
                <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle>Equivalent CGPA</CardTitle>
                        <CardDescription>Your percentage converted to a {scale}-point scale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{cgpa}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

