
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AspectRatio, Calculator, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Function to find the greatest common divisor
const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

export function ImageAspectRatioCalculator() {
    // For finding ratio
    const [width1, setWidth1] = useState('1920');
    const [height1, setHeight1] = useState('1080');
    const [ratioResult, setRatioResult] = useState('16:9');

    // For finding dimensions
    const [width2, setWidth2] = useState('');
    const [height2, setHeight2] = useState('');
    const [ratioX, setRatioX] = useState('16');
    const [ratioY, setRatioY] = useState('9');

    useEffect(() => {
        const w = parseInt(width1, 10);
        const h = parseInt(height1, 10);
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
            const divisor = gcd(w, h);
            setRatioResult(`${w / divisor}:${h / divisor}`);
        } else {
            setRatioResult('');
        }
    }, [width1, height1]);
    
    useEffect(() => {
        const w = parseInt(width2, 10);
        const rX = parseInt(ratioX, 10);
        const rY = parseInt(ratioY, 10);
        if (!isNaN(w) && w > 0 && !isNaN(rX) && !isNaN(rY) && rX > 0 && rY > 0) {
            const newHeight = (w * rY) / rX;
            setHeight2(newHeight.toFixed(0));
        } else if (width2 === '') {
            setHeight2('');
        }
    }, [width2, ratioX, ratioY]);
    
    useEffect(() => {
        const h = parseInt(height2, 10);
        const rX = parseInt(ratioX, 10);
        const rY = parseInt(ratioY, 10);
        if (!isNaN(h) && h > 0 && !isNaN(rX) && !isNaN(rY) && rX > 0 && rY > 0) {
            const newWidth = (h * rX) / rY;
            setWidth2(newWidth.toFixed(0));
        } else if (height2 === '') {
            setWidth2('');
        }
    }, [height2, ratioX, ratioY]);

    return (
        <Tabs defaultValue="find-ratio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="find-ratio">Find Aspect Ratio</TabsTrigger>
                <TabsTrigger value="find-dimensions">Find Dimensions</TabsTrigger>
            </TabsList>
            <TabsContent value="find-ratio">
                <Card>
                    <CardHeader><CardTitle>Find Aspect Ratio</CardTitle><CardDescription>Enter dimensions to calculate the ratio.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="width1">Width</Label><Input id="width1" type="number" value={width1} onChange={e => setWidth1(e.target.value)} placeholder="e.g., 1920"/></div>
                            <div className="space-y-2"><Label htmlFor="height1">Height</Label><Input id="height1" type="number" value={height1} onChange={e => setHeight1(e.target.value)} placeholder="e.g., 1080"/></div>
                        </div>
                        {ratioResult && (
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Calculated Aspect Ratio</p>
                                <p className="text-3xl font-bold text-primary">{ratioResult}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="find-dimensions">
                <Card>
                    <CardHeader><CardTitle>Find Dimensions</CardTitle><CardDescription>Enter one dimension and the ratio to find the other.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Aspect Ratio</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="number" value={ratioX} onChange={e => setRatioX(e.target.value)} placeholder="16"/>
                                    <span className="font-bold">:</span>
                                    <Input type="number" value={ratioY} onChange={e => setRatioY(e.target.value)} placeholder="9"/>
                                </div>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="width2">New Width</Label>
                                <Input id="width2" type="number" value={width2} onChange={e => setWidth2(e.target.value)} placeholder="Enter width..."/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height2">New Height</Label>
                                <Input id="height2" type="number" value={height2} onChange={e => setHeight2(e.target.value)} placeholder="...or enter height"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
