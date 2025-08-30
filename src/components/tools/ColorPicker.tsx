
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ColorPicker() {
  const [color, setColor] = useState('#7c3aed');
  const { toast } = useToast();

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `Copied ${value} to clipboard!` });
  };

  const toRgb = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : '';
  };
  
  const toHsl = (hex: string) => {
    let r = parseInt(hex.substring(1,3), 16) / 255;
    let g = parseInt(hex.substring(3,5), 16) / 255;
    let b = parseInt(hex.substring(5,7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h=0, s, l = (max + min) / 2;

    if(max == min){ h = s = 0; }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${(h*360).toFixed(0)}, ${(s*100).toFixed(0)}%, ${(l*100).toFixed(0)}%)`;
  };

  const rgbValue = toRgb(color);
  const hslValue = toHsl(color);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative">
            <div style={{ backgroundColor: color }} className="w-48 h-48 rounded-full border-8 border-background shadow-lg" />
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="w-full md:w-auto md:flex-1 space-y-4">
            <div className="space-y-2">
                <Label>HEX</Label>
                <div className="flex gap-2"><Input readOnly value={color} /><Button variant="outline" size="icon" onClick={() => handleCopy(color)}><Copy/></Button></div>
            </div>
            <div className="space-y-2">
                <Label>RGB</Label>
                <div className="flex gap-2"><Input readOnly value={rgbValue} /><Button variant="outline" size="icon" onClick={() => handleCopy(rgbValue)}><Copy/></Button></div>
            </div>
             <div className="space-y-2">
                <Label>HSL</Label>
                <div className="flex gap-2"><Input readOnly value={hslValue} /><Button variant="outline" size="icon" onClick={() => handleCopy(hslValue)}><Copy/></Button></div>
            </div>
        </div>
    </div>
  );
}
