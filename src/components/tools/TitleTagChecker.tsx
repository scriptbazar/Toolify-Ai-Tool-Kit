
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '../ui/card';

export function TitleTagChecker() {
    const [title, setTitle] = useState('');
    
    // Google's pixel limit for titles is around 600px.
    // Average character width is an approximation.
    const pixelWidth = title.length * 7.5; 
    const pixelProgress = Math.min((pixelWidth / 600) * 100, 100);
    const charProgress = Math.min((title.length / 60) * 100, 100);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title-input">Your Title Tag</Label>
                <Input id="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your title tag to check its length" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Length (Characters: {title.length}/60)</Label>
                    <Progress value={charProgress} className="mt-2" />
                </div>
                 <div>
                    <Label>Width (Pixels: {pixelWidth.toFixed(0)}/600)</Label>
                    <Progress value={pixelProgress} className="mt-2" />
                </div>
            </div>

            <div>
                 <Label>SERP Preview</Label>
                 <Card className="mt-2">
                    <CardContent className="p-4">
                        <p className="text-blue-700 text-xl truncate">{title || "Your Title Will Appear Here"}</p>
                        <p className="text-green-600 text-sm">https://yourwebsite.com/your-page</p>
                        <p className="text-gray-600 text-sm mt-1">Your meta description would appear here, providing a brief summary of the page's content for the user.</p>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
