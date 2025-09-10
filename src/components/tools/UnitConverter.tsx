
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';

const conversionFactors: { [key: string]: { [key: string]: number } } = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144, nm: 1e-9 },
  mass: { kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495, t: 1000, st: 6.35029 },
  temperature: {}, // Special handling
  area: { sqm: 1, sqkm: 1e6, sqcm: 1e-4, sqmi: 2.59e6, sqft: 0.092903, acre: 4046.86, ha: 10000 },
  volume: { l: 1, ml: 0.001, 'cubic-m': 1000, 'cubic-cm': 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
  speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  time: { s: 1, ms: 0.001, min: 60, hr: 3600, day: 86400, week: 604800 },
  data: { B: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4, PB: 1024**5 },
};

const units: { [key: string]: string[] } = {
  length: ['m', 'km', 'cm', 'mm', 'mi', 'ft', 'in', 'yd', 'nm'],
  mass: ['kg', 'g', 'mg', 'lb', 'oz', 't', 'st'],
  temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  area: ['sqm', 'sqkm', 'sqcm', 'sqmi', 'sqft', 'acre', 'ha'],
  volume: ['l', 'ml', 'cubic-m', 'cubic-cm', 'gal', 'qt', 'pt', 'cup'],
  speed: ['m/s', 'km/h', 'mph', 'knot'],
  time: ['s', 'ms', 'min', 'hr', 'day', 'week'],
  data: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
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
      // Use toPrecision for better handling of very small or large numbers
      setOutputValue(result.toPrecision(6));
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
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="data">Data Storage</SelectItem>
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
