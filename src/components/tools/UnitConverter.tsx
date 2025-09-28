
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { unitData } from '@/lib/unit-data';

export function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState(unitData.length.units[0].value);
  const [toUnit, setToUnit] = useState(unitData.length.units[1].value);
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('');

  const currentCategoryData = (unitData as any)[category];

  useEffect(() => {
    convert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit, category]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const newUnits = (unitData as any)[val].units;
    setFromUnit(newUnits[0].value);
    setToUnit(newUnits[1].value);
  };
  
  const handleSwap = () => {
    const oldFrom = fromUnit;
    const oldInput = inputValue;
    setFromUnit(toUnit);
    setToUnit(oldFrom);
    setInputValue(outputValue);
    setOutputValue(oldInput);
  };

  const convert = () => {
    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) {
      setOutputValue('');
      return;
    }

    if (category === 'temperature') {
      let result;
      if (fromUnit === 'Celsius') {
        if (toUnit === 'Fahrenheit') result = (inputNum * 9/5) + 32;
        else if (toUnit === 'Kelvin') result = inputNum + 273.15;
        else result = inputNum;
      } else if (fromUnit === 'Fahrenheit') {
        if (toUnit === 'Celsius') result = (inputNum - 32) * 5/9;
        else if (toUnit === 'Kelvin') result = ((inputNum - 32) * 5/9) + 273.15;
        else result = inputNum;
      } else { // Kelvin
        if (toUnit === 'Celsius') result = inputNum - 273.15;
        else if (toUnit === 'Fahrenheit') result = ((inputNum - 273.15) * 9/5) + 32;
        else result = inputNum;
      }
      setOutputValue(result.toPrecision(6));
    } else {
      const fromFactor = currentCategoryData.factors[fromUnit];
      const toFactor = currentCategoryData.factors[toUnit];
      const result = (inputNum * fromFactor) / toFactor;
      // Use toPrecision for better handling of very small or large numbers
      setOutputValue(result.toPrecision(6));
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Conversion Type</CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.keys(unitData).map(catKey => (
                            <SelectItem key={catKey} value={catKey}>{(unitData as any)[catKey].name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Card className="flex-1">
            <CardHeader><CardTitle>From</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="h-12 text-lg" />
                <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentCategoryData.units.map((u: any) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
        
        <Button variant="outline" size="icon" onClick={handleSwap} className="shrink-0 mt-8">
          <ArrowRightLeft className="h-5 w-5"/>
        </Button>
        
        <Card className="flex-1">
             <CardHeader><CardTitle>To</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <Input value={outputValue} readOnly className="bg-muted font-bold h-12 text-lg" />
                <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentCategoryData.units.map((u: any) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
