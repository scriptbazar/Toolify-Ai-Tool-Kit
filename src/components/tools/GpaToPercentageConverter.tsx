
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { GraduationCap, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const universityFormulas: { [key: string]: (gpa: number) => number } = {
    'custom': (gpa) => gpa * 10, // Default custom
    'VTU': (gpa) => (gpa - 0.75) * 10,
    'Anna University': (gpa) => gpa * 10,
    'Mumbai University': (gpa) => 7.1 * gpa + 11,
    'Pune University': (gpa) => 10 * gpa - 7.5,
    'GTU': (gpa) => (gpa - 0.5) * 10,
};

export function GpaToPercentageConverter() {
    const { toast } = useToast();

    // State for GPA to Percentage
    const [gpa, setGpa] = useState('8.5');
    const [university, setUniversity] = useState('custom');
    const [customMultiplier, setCustomMultiplier] = useState('10');
    const [percentageResult, setPercentageResult] = useState<string | null>(null);

    // State for Percentage to GPA
    const [percentage, setPercentage] = useState('85');
    const [gpaScale, setGpaScale] = useState('10');
    const [gpaResult, setGpaResult] = useState<string | null>(null);

    const handleGpaToPerc = () => {
        const gpaVal = parseFloat(gpa);
        if (isNaN(gpaVal) || gpaVal < 0) {
            toast({ title: "Invalid GPA", variant: "destructive" });
            return;
        }

        let result;
        if (university === 'custom') {
            const multiplier = parseFloat(customMultiplier);
            if(isNaN(multiplier)) {
                 toast({ title: "Invalid Custom Multiplier", variant: "destructive" });
                 return;
            }
            result = gpaVal * multiplier;
        } else {
            result = universityFormulas[university](gpaVal);
        }
        setPercentageResult(result.toFixed(2));
    };

    const handlePercToGpa = () => {
        const percVal = parseFloat(percentage);
        const scale = parseFloat(gpaScale);
        if (isNaN(percVal) || percVal < 0 || percVal > 100 || isNaN(scale) || scale <= 0) {
             toast({ title: "Invalid Input", variant: "destructive" });
            return;
        }
        const result = (percVal / 100) * scale;
        setGpaResult(result.toFixed(2));
    };


    return (
        <Tabs defaultValue="gpaToPerc" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gpaToPerc">GPA to Percentage</TabsTrigger>
                <TabsTrigger value="percToGpa">Percentage to GPA</TabsTrigger>
            </TabsList>
            <TabsContent value="gpaToPerc">
                <Card>
                    <CardHeader><CardTitle>GPA to Percentage Converter</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="university-select">University</Label>
                            <Select value={university} onValueChange={setUniversity}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom">Custom Formula</SelectItem>
                                    {Object.keys(universityFormulas).filter(k => k !== 'custom').map(uni => (
                                        <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gpa-input">Your GPA</Label>
                                <Input id="gpa-input" type="number" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="e.g., 8.5" />
                            </div>
                            {university === 'custom' && (
                                <div className="space-y-2">
                                    <Label htmlFor="custom-multiplier">Multiplier</Label>
                                    <Input id="custom-multiplier" type="number" value={customMultiplier} onChange={e => setCustomMultiplier(e.target.value)} />
                                </div>
                            )}
                        </div>
                         <Button onClick={handleGpaToPerc} className="w-full"><GraduationCap className="mr-2 h-4 w-4"/>Convert</Button>
                         {percentageResult !== null && (
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Equivalent Percentage</p>
                                <p className="text-4xl font-bold text-primary">{percentageResult}%</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="percToGpa">
                <Card>
                     <CardHeader><CardTitle>Percentage to GPA Converter</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="percentage-input">Your Percentage</Label>
                                <Input id="percentage-input" type="number" value={percentage} onChange={e => setPercentage(e.target.value)} placeholder="e.g., 85"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="gpa-scale-select">Target GPA Scale</Label>
                                <Select value={gpaScale} onValueChange={setGpaScale}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10-Point Scale</SelectItem>
                                        <SelectItem value="5">5-Point Scale</SelectItem>
                                        <SelectItem value="4">4-Point Scale</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handlePercToGpa} className="w-full"><GraduationCap className="mr-2 h-4 w-4"/>Convert</Button>
                         {gpaResult !== null && (
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Equivalent GPA</p>
                                <p className="text-4xl font-bold text-primary">{gpaResult}</p>
                            </div>
                        )}
                     </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
