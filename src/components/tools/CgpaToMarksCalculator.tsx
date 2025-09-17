
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function CgpaToMarksCalculator() {
  const [activeTab, setActiveTab] = useState('cgpaToPerc');
  
  const [cgpa, setCgpa] = useState('8.5');
  const [cgpaFactor, setCgpaFactor] = useState('9.5');
  const [percentage, setPercentage] = useState('');

  const [perc, setPerc] = useState('80.75');
  const [percScale, setPercScale] = useState('10');
  const [resultCgpa, setResultCgpa] = useState('');

  useEffect(() => {
    if (activeTab === 'cgpaToPerc') {
      const cgpaVal = parseFloat(cgpa);
      const factor = parseFloat(cgpaFactor);
      if (!isNaN(cgpaVal) && !isNaN(factor) && cgpaVal >= 0 && factor > 0) {
        setPercentage((cgpaVal * factor).toFixed(2));
      } else {
        setPercentage('');
      }
    }
  }, [cgpa, cgpaFactor, activeTab]);

  useEffect(() => {
    if (activeTab === 'percToCgpa') {
        const percVal = parseFloat(perc);
        const scaleVal = parseFloat(percScale);
        if (!isNaN(percVal) && !isNaN(scaleVal) && percVal >= 0 && scaleVal > 0) {
            setResultCgpa(((percVal / 100) * scaleVal).toFixed(2));
        } else {
            setResultCgpa('');
        }
    }
  }, [perc, percScale, activeTab]);


  return (
    <Tabs defaultValue="cgpaToPerc" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cgpaToPerc">CGPA to Percentage</TabsTrigger>
            <TabsTrigger value="percToCgpa">Percentage to CGPA</TabsTrigger>
        </TabsList>
        <TabsContent value="cgpaToPerc">
            <Card>
                <CardHeader>
                    <CardTitle>CGPA to Percentage Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cgpa-input">Your CGPA</Label>
                            <Input id="cgpa-input" type="number" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="e.g., 8.7"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="factor-input">Conversion Factor</Label>
                            <Input id="factor-input" type="number" value={cgpaFactor} onChange={(e) => setCgpaFactor(e.target.value)} placeholder="e.g., 9.5"/>
                            <p className="text-xs text-muted-foreground">Most universities use 9.5.</p>
                        </div>
                    </div>
                     {percentage && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Equivalent Percentage</p>
                            <p className="text-3xl font-bold text-primary">{percentage}%</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="percToCgpa">
             <Card>
                <CardHeader>
                    <CardTitle>Percentage to CGPA Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="perc-input">Your Percentage (%)</Label>
                            <Input id="perc-input" type="number" value={perc} onChange={(e) => setPerc(e.target.value)} placeholder="e.g., 80.75"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scale-input">CGPA Scale</Label>
                            <Input id="scale-input" type="number" value={percScale} onChange={(e) => setPercScale(e.target.value)} placeholder="e.g., 10"/>
                             <p className="text-xs text-muted-foreground">Usually 10 or 4.</p>
                        </div>
                    </div>
                    {resultCgpa && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Equivalent CGPA</p>
                            <p className="text-3xl font-bold text-primary">{resultCgpa}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
