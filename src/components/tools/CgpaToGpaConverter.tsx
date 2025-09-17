
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

export function CgpaToGpaConverter() {
    const [cgpa, setCgpa] = useState('');
    const [cgpaScale, setCgpaScale] = useState('10');
    const [gpaScale, setGpaScale] = useState('4');
    const [resultGpa, setResultGpa] = useState<string | null>(null);
    const { toast } = useToast();

    const handleConvert = () => {
        const cgpaVal = parseFloat(cgpa);
        const cgpaScaleVal = parseFloat(cgpaScale);
        const gpaScaleVal = parseFloat(gpaScale);

        if (isNaN(cgpaVal) || isNaN(cgpaScaleVal) || isNaN(gpaScaleVal) || cgpaVal < 0 || cgpaScaleVal <= 0 || gpaScaleVal <= 0) {
            toast({ title: 'Invalid Input', description: 'Please enter valid positive numbers for all fields.', variant: 'destructive' });
            return;
        }

        if (cgpaVal > cgpaScaleVal) {
            toast({ title: 'Invalid CGPA', description: 'CGPA cannot be greater than its scale.', variant: 'destructive' });
            return;
        }

        const calculatedGpa = (cgpaVal / cgpaScaleVal) * gpaScaleVal;
        setResultGpa(calculatedGpa.toFixed(2));
    };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="cgpa-input">Your CGPA</Label>
                <Input id="cgpa-input" type="number" value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="e.g., 8.5" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="cgpa-scale">CGPA Scale</Label>
                <Select value={cgpaScale} onValueChange={setCgpaScale}>
                    <SelectTrigger id="cgpa-scale"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10-Point Scale</SelectItem>
                        <SelectItem value="5">5-Point Scale</SelectItem>
                        <SelectItem value="4">4-Point Scale</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="gpa-scale">Target GPA Scale</Label>
                 <Select value={gpaScale} onValueChange={setGpaScale}>
                    <SelectTrigger id="gpa-scale"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="4">4.0 Scale</SelectItem>
                        <SelectItem value="5">5.0 Scale</SelectItem>
                        <SelectItem value="10">10.0 Scale</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button onClick={handleConvert} className="w-full">
            <GraduationCap className="mr-2 h-4 w-4" /> Convert to GPA
        </Button>

        {resultGpa !== null && (
            <Card className="mt-6 text-center">
                <CardHeader>
                    <CardTitle>Converted GPA</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{resultGpa}</p>
                    <p className="text-muted-foreground">on a {gpaScale}-point scale</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
