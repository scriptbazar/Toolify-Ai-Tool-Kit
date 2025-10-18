
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Download, Trash2, PenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function TextToHandwritingConverter() {
    const [text, setText] = useState('This is a sample of handwritten text.');
    const { toast } = useToast();

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleDownload = () => {
        if (!text) return;
        const doc = new jsPDF();
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

            <Card>
                <CardHeader>
                    <CardTitle>Handwriting Preview</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[200px] border rounded-md p-4 font-cursive text-xl leading-loose bg-muted">
                    <pre>{text}</pre>
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

    