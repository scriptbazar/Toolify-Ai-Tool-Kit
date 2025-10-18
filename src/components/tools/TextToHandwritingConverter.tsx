
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Download, Trash2, PenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

const fontOptions = [
    { name: 'Cedarville Cursive', value: 'font-cedarville' },
    { name: 'Dancing Script', value: 'font-dancing' },
    { name: 'Indie Flower', value: 'font-indie' },
    { name: 'Kalam', value: 'font-kalam' },
    { name: 'Marck Script', value: 'font-marck' },
    { name: 'Nanum Pen Script', value: 'font-nanum' },
    { name: 'Patrick Hand', value: 'font-patrick' },
    { name: 'Permanent Marker', value: 'font-permanent' },
    { name: 'Rock Salt', value: 'font-rocksalt' },
    { name: 'Sacramento', value: 'font-sacramento' },
];

export function TextToHandwritingConverter() {
    const [text, setText] = useState('This is a sample of handwritten text.');
    const [selectedFont, setSelectedFont] = useState(fontOptions[0].value);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleDownload = () => {
        if (!text) return;
        const doc = new jsPDF();
        // NOTE: jsPDF does not support custom web fonts easily without TTF files.
        // It will use a default cursive-like font. The web preview is more accurate.
        doc.setFont('cursive');
        doc.setFontSize(16);
        doc.text(text, 10, 10);
        doc.save('handwriting.pdf');
    };

    const handleClear = () => {
        setText('');
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="text-input">Your Text</Label>
                <Textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="min-h-[200px]"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="font-select">Choose a Handwriting Style</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger id="font-select">
                        <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                        {fontOptions.map(font => (
                            <SelectItem key={font.value} value={font.value} className={font.value}>
                                {font.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Handwriting Preview</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[200px] border rounded-md p-4 text-xl leading-loose bg-muted">
                    <pre className={cn(selectedFont)}>{text}</pre>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopy} disabled={!text} variant="outline">
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                </Button>
                 <Button onClick={handleDownload} disabled={!text}>
                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                </Button>
                <Button onClick={handleClear} disabled={!text} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
            </div>
        </div>
    );
}
