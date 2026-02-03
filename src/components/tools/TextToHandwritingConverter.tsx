'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Download, Trash2, PenLine, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { generateSampleText } from '@/ai/flows/ai-writer';
import { Cedarville_Cursive, Dancing_Script, Indie_Flower, Kalam, Marck_Script, Patrick_Hand, Permanent_Marker, Rock_Salt, Sacramento, Caveat, Pacifico, Homemade_Apple, Zeyada } from 'next/font/google';

const cedarville = Cedarville_Cursive({ weight: '400', subsets: ['latin'], variable: '--font-cedarville', display: 'swap' });
const dancing = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing', display: 'swap' });
const indie = Indie_Flower({ weight: '400', subsets: ['latin'], variable: '--font-indie', display: 'swap' });
const kalam = Kalam({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-kalam', display: 'swap' });
const marck = Marck_Script({ weight: '400', subsets: ['latin'], variable: '--font-marck', display: 'swap' });
const patrick = Patrick_Hand({ weight: '400', subsets: ['latin'], variable: '--font-patrick', display: 'swap' });
const permanent = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-permanent', display: 'swap' });
const rocksalt = Rock_Salt({ weight: '400', subsets: ['latin'], variable: '--font-rocksalt', display: 'swap' });
const sacramento = Sacramento({ weight: '400', subsets: ['latin'], variable: '--font-sacramento', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-pacifico', display: 'swap' });
const homemadeApple = Homemade_Apple({ weight: '400', subsets: ['latin'], variable: '--font-homemade-apple', display: 'swap' });
const zeyada = Zeyada({ weight: '400', subsets: ['latin'], variable: '--font-zeyada', display: 'swap' });

const fontOptions = [
    { name: 'Cedarville Cursive', value: cedarville.variable },
    { name: 'Dancing Script', value: dancing.variable },
    { name: 'Indie Flower', value: indie.variable },
    { name: 'Kalam', value: kalam.variable },
    { name: 'Marck Script', value: marck.variable },
    { name: 'Patrick Hand', value: patrick.variable },
    { name: 'Permanent Marker', value: permanent.variable },
    { name: 'Rock Salt', value: rocksalt.variable },
    { name: 'Sacramento', value: sacramento.variable },
    { name: 'Caveat', value: caveat.variable },
    { name: 'Pacifico', value: pacifico.variable },
    { name: 'Homemade Apple', value: homemadeApple.variable },
    { name: 'Zeyada', value: zeyada.variable },
];

export function TextToHandwritingConverter() {
    const [text, setText] = useState('This is a sample of handwritten text.');
    const [selectedFont, setSelectedFont] = useState(fontOptions[0].value);
    const [fontSize, setFontSize] = useState(24);
    const [fontColor, setFontColor] = useState('#000000');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleDownload = async () => {
        if (!text) return;
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        doc.setFontSize(fontSize);
        doc.setTextColor(fontColor);
        doc.text(text, 10, 10);
        doc.save('handwriting.pdf');
    };

    const handleClear = () => {
        setText('');
    };

    const handleGenerateSample = async () => {
        setIsLoading(true);
        try {
            const result = await generateSampleText();
            setText(result.sampleText);
            toast({ title: 'Sample Text Generated!' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>1. Enter Your Text</CardTitle></CardHeader>
                    <CardContent>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type or paste your text here..."
                            className="min-h-[200px]"
                        />
                        <Button onClick={handleGenerateSample} variant="outline" size="sm" className="mt-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Sample Text
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>2. Customize Style</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="font-select">Handwriting Style</Label>
                            <Select value={selectedFont} onValueChange={setSelectedFont}>
                                <SelectTrigger id="font-select">
                                    <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontOptions.map(font => (
                                        <SelectItem key={font.value} value={font.value} className={cn('text-lg', font.value)}>
                                            {font.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Font Size: {fontSize}px</Label>
                                <Slider value={[fontSize]} onValueChange={([val]) => setFontSize(val)} min={12} max={48} step={2} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="font-color">Font Color</Label>
                                <Input id="font-color" type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-full h-10 p-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCopy} disabled={!text} variant="outline" className="flex-1">
                        <Copy className="mr-2 h-4 w-4" /> Copy Text
                    </Button>
                    <Button onClick={handleDownload} disabled={!text} className="flex-1">
                        <Download className="mr-2 h-4 w-4" /> Download as PDF
                    </Button>
                    <Button onClick={handleClear} disabled={!text} variant="destructive" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PenLine className="h-5 w-5"/>
                        Handwriting Preview
                    </CardTitle>
                </CardHeader>
                <CardContent 
                    className="min-h-[400px] lg:min-h-[550px] border rounded-md p-6 leading-relaxed bg-muted"
                    style={{
                        fontSize: `${fontSize}px`,
                        color: fontColor,
                    }}
                >
                    <pre className={cn("whitespace-pre-wrap w-full h-full", selectedFont)}>{text}</pre>
                </CardContent>
            </Card>
        </div>
    );
}
