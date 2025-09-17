
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CgpaToMarksCalculator() {
  const [cgpa, setCgpa] = useState('');
  const [conversionFactor, setConversionFactor] = useState('9.5');
  const [percentage, setPercentage] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const cgpaVal = parseFloat(cgpa);
    const factor = parseFloat(conversionFactor);

    if (isNaN(cgpaVal) || isNaN(factor) || cgpaVal < 0 || factor <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid CGPA and conversion factor.',
        variant: 'destructive',
      });
      return;
    }
    
    if (cgpaVal > 10) {
         toast({
            title: 'High CGPA Value',
            description: 'CGPA is usually on a scale of 10. Please double-check your value.',
            variant: 'default',
        });
    }

    setPercentage(cgpaVal * factor);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cgpa-input">Your CGPA</Label>
          <Input
            id="cgpa-input"
            type="number"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="e.g., 8.7"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="factor-input">Conversion Factor</Label>
          <Input
            id="factor-input"
            type="number"
            value={conversionFactor}
            onChange={(e) => setConversionFactor(e.target.value)}
            placeholder="e.g., 9.5"
          />
           <p className="text-xs text-muted-foreground">Most universities use a factor of 9.5.</p>
        </div>
      </div>
      <Button onClick={handleCalculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Percentage
      </Button>

      {percentage !== null && (
        <Card className="mt-6 text-center">
          <CardHeader>
            <CardTitle>Estimated Percentage</CardTitle>
            <CardDescription>
              Your CGPA of {cgpa} is approximately equal to:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{percentage.toFixed(2)}%</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
