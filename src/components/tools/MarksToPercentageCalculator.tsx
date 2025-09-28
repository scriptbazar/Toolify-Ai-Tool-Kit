
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

export function MarksToPercentageCalculator() {
    const [marks, setMarks] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [percentageResult, setPercentageResult] = useState<number | null>(null);

    const [percentageForMarks, setPercentageForMarks] = useState('');
    const [totalMarksForMarks, setTotalMarksForMarks] = useState('');
    const [marksResult, setMarksResult] = useState<number | null>(null);

    const { toast } = useToast();

    const calculatePercentage = () => {
        const marksNum = parseFloat(marks);
        const totalNum = parseFloat(totalMarks);

        if (isNaN(marksNum) || isNaN(totalNum) || totalNum <= 0 || marksNum < 0 || marksNum > totalNum) {
            toast({ title: "Invalid Input", description: "Please enter valid marks. Obtained marks cannot be greater than total marks.", variant: "destructive"});
            return;
        }
        setPercentageResult((marksNum / totalNum) * 100);
    };
    
    const calculateMarks = () => {
        const percNum = parseFloat(percentageForMarks);
        const totalNum = parseFloat(totalMarksForMarks);

        if (isNaN(percNum) || isNaN(totalNum) || totalNum <= 0 || percNum < 0 || percNum > 100) {
            toast({ title: "Invalid Input", description: "Please enter a valid percentage (0-100) and total marks.", variant: "destructive"});
            return;
        }
        setMarksResult((percNum / 100) * totalNum);
    };

    return (
        <Tabs defaultValue="marksToPerc" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="marksToPerc">Calculate Percentage</TabsTrigger>
                <TabsTrigger value="percToMarks">Calculate Marks</TabsTrigger>
            </TabsList>
            <TabsContent value="marksToPerc">
                <Card>
                    <CardHeader>
                        <CardTitle>Marks to Percentage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="marks-obtained">Marks Obtained</Label>
                                <Input id="marks-obtained" type="number" value={marks} onChange={e => setMarks(e.target.value)} placeholder="e.g., 85"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="total-marks">Total Marks</Label>
                                <Input id="total-marks" type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} placeholder="e.g., 100"/>
                            </div>
                        </div>
                        <Button onClick={calculatePercentage} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                         {percentageResult !== null && (
                            <div className="text-center p-4 bg-muted rounded-lg space-y-2">
                                <p className="text-sm text-muted-foreground">Your Percentage</p>
                                <p className="text-4xl font-bold text-primary">{percentageResult.toFixed(2)}%</p>
                                <Progress value={percentageResult} className="w-full" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="percToMarks">
                <Card>
                    <CardHeader>
                        <CardTitle>Percentage to Marks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="perc-for-marks">Percentage (%)</Label>
                                <Input id="perc-for-marks" type="number" value={percentageForMarks} onChange={e => setPercentageForMarks(e.target.value)} placeholder="e.g., 85"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="total-for-marks">Total Marks</Label>
                                <Input id="total-for-marks" type="number" value={totalMarksForMarks} onChange={e => setTotalMarksForMarks(e.target.value)} placeholder="e.g., 100"/>
                            </div>
                        </div>
                        <Button onClick={calculateMarks} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                         {marksResult !== null && (
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Marks Obtained</p>
                                <p className="text-4xl font-bold text-primary">{marksResult.toFixed(2)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
