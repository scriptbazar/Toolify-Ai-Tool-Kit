
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

export function ColorPicker() {
  const [color, setColor] = useState('#7c3aed');
  const { toast } = useToast();

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `Copied ${value} to clipboard!` });
  };

  const colorValues = useMemo(() => {
    const hex = color;
    let r = 0, g = 0, b = 0;
    
    // HEX to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      r = parseInt(result[1], 16);
      g = parseInt(result[2], 16);
      b = parseInt(result[3], 16);
    }
    const rgb = `rgb(${r}, ${g}, ${b})`;

    // RGB to HSL
    const rR = r / 255, gG = g / 255, bB = b / 255;
    const max = Math.max(rR, gG, bB), min = Math.min(rR, gG, bB);
    let h = 0, s, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rR: h = (gG - bB) / d + (gG < bB ? 6 : 0); break;
        case gG: h = (bB - rR) / d + 2; break;
        case bB: h = (rR - gG) / d + 4; break;
      }
      h /= 6;
    }
    const hsl = `hsl(${(h * 360).toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;

    // RGB to CMYK
    if (r === 0 && g === 0 && b === 0) {
      const cmyk = "cmyk(0%, 0%, 0%, 100%)";
      return { hex, rgb, hsl, cmyk };
    }
    let c = 1 - rR;
    let m = 1 - gG;
    let y = 1 - bB;
    let k = Math.min(c, m, y);
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    const cmyk = `cmyk(${(c * 100).toFixed(0)}%, ${(m * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%, ${(k * 100).toFixed(0)}%)`;
    
    return { hex, rgb, hsl, cmyk };
  }, [color]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="relative w-48 h-48">
            <div style={{ backgroundColor: color }} className="w-full h-full rounded-full border-8 border-background shadow-lg" />
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <Card className="w-full md:w-auto md:flex-1">
            <CardHeader>
                <CardTitle>Color Values</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {Object.entries(colorValues).map(([name, value]) => (
                            <TableRow key={name}>
                                <TableCell className="font-semibold uppercase">{name}</TableCell>
                                <TableCell className="font-mono">{value}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy(value)}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
