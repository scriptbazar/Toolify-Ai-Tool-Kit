
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Monitor, Smartphone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


// Character width estimations for pixel calculation
const CHAR_WIDTHS: { [key: string]: number } = {
  'i': 3, 'l': 3, 't': 4, 'f': 5, 'j': 5, 'r': 5, ' ': 4,
  'm': 10, 'w': 10,
  'default': 7,
  'uppercase': 8.5
};

const getPixelWidth = (text: string) => {
  let width = 0;
  for (const char of text) {
    if (CHAR_WIDTHS[char]) {
      width += CHAR_WIDTHS[char];
    } else if (char === char.toUpperCase() && char !== ' ') {
      width += CHAR_WIDTHS['uppercase'];
    } else {
      width += CHAR_WIDTHS['default'];
    }
  }
  return width;
};


export function TitleTagChecker() {
    const [title, setTitle] = useState('');
    const [pixelWidth, setPixelWidth] = useState(0);
    const [activeTab, setActiveTab] = useState('desktop');
    
    useEffect(() => {
        setPixelWidth(getPixelWidth(title));
    }, [title]);

    const MAX_PIXELS = 600;
    const MAX_CHARS = 60;
    
    const pixelProgress = Math.min((pixelWidth / MAX_PIXELS) * 100, 100);
    const charProgress = Math.min((title.length / MAX_CHARS) * 100, 100);
    const wordCount = title.trim() === '' ? 0 : title.trim().split(/\s+/).length;
    
    const getStatus = (value: number, min: number, max: number) => {
        if (value < min) return { label: 'Too Short', color: 'text-yellow-500', icon: AlertCircle };
        if (value > max) return { label: 'Too Long', color: 'text-red-500', icon: XCircle };
        return { label: 'Good', color: 'text-green-500', icon: CheckCircle };
    };

    const pixelStatus = getStatus(pixelWidth, 200, MAX_PIXELS);
    const charStatus = getStatus(title.length, 20, MAX_CHARS);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="title-input">Your Title Tag</Label>
                    <Input id="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your title tag to check its length" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <Card>
                        <CardHeader className="p-2 pb-0"><CardTitle className="text-sm font-medium text-muted-foreground">Pixel Width</CardTitle></CardHeader>
                        <CardContent className="p-2 pt-0">
                            <p className="text-2xl font-bold">{pixelWidth.toFixed(0)} / {MAX_PIXELS}</p>
                            <div className="flex items-center justify-center gap-1">
                                <pixelStatus.icon className={cn("h-4 w-4", pixelStatus.color)}/>
                                <span className={cn("text-xs font-semibold", pixelStatus.color)}>{pixelStatus.label}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="p-2 pb-0"><CardTitle className="text-sm font-medium text-muted-foreground">Characters</CardTitle></CardHeader>
                        <CardContent className="p-2 pt-0">
                            <p className="text-2xl font-bold">{title.length} / {MAX_CHARS}</p>
                             <div className="flex items-center justify-center gap-1">
                                <charStatus.icon className={cn("h-4 w-4", charStatus.color)}/>
                                <span className={cn("text-xs font-semibold", charStatus.color)}>{charStatus.label}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="p-2 pb-0"><CardTitle className="text-sm font-medium text-muted-foreground">Word Count</CardTitle></CardHeader>
                        <CardContent className="p-2 pt-0">
                            <p className="text-2xl font-bold">{wordCount}</p>
                             <div className="flex items-center justify-center gap-1">
                                 <span className="text-xs text-muted-foreground">&nbsp;</span>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div>
                 <Label>SERP Preview</Label>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4"/>Desktop</TabsTrigger>
                        <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4"/>Mobile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="desktop">
                         <Card>
                            <CardContent className="p-4">
                                <p className="text-blue-700 text-xl truncate">{title || "Your Title Will Appear Here"}</p>
                                <p className="text-green-600 text-sm">https://yourwebsite.com/your-page</p>
                                <p className="text-gray-600 text-sm mt-1">Your meta description would appear here, providing a brief summary of the page's content for the user.</p>
                            </CardContent>
                         </Card>
                    </TabsContent>
                    <TabsContent value="mobile">
                          <Card className="max-w-[360px] mx-auto">
                            <CardContent className="p-3">
                                <p className="text-blue-700 text-base truncate">{title || "Your Title Will Appear Here"}</p>
                                <p className="text-green-600 text-xs">https://yourwebsite.com/your-page</p>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">Your meta description would appear here, providing a brief summary of the page's content for the user.</p>
                            </CardContent>
                         </Card>
                    </TabsContent>
                 </Tabs>
            </div>
        </div>
    );
}
