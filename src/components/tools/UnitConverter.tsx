
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';

const conversionFactors: { [key: string]: { [key: string]: number } } = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254 },
  mass: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
  temperature: {}, // Special handling
};

const units: { [key: string]: string[] } = {
  length: ['m', 'km', 'cm', 'mm', 'mi', 'ft', 'in'],
  mass: ['kg', 'g', 'mg', 'lb', 'oz'],
  temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
};

export function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState(units.length[0]);
  const [toUnit, setToUnit] = useState(units.length[1]);
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('');

  useEffect(() => {
    convert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit, category]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setFromUnit((units as any)[val][0]);
    setToUnit((units as any)[val][1]);
  };
  
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
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
      setOutputValue(result.toFixed(3));
    } else {
      const fromFactor = conversionFactors[category][fromUnit];
      const toFactor = conversionFactors[category][toUnit];
      const result = (inputNum * fromFactor) / toFactor;
      setOutputValue(result.toPrecision(5));
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="category">Conversion Type</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="length">Length</SelectItem>
                    <SelectItem value="mass">Mass</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                </SelectContent>
            </Select>
        </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <div className="space-y-2">
            <Input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} />
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(units as any)[category].map((u: string) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={handleSwap}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-2">
          <Label>To</Label>
          <div className="space-y-2">
            <Input value={outputValue} readOnly className="bg-muted font-bold" />
             <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(units as any)[category].map((u: string) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
