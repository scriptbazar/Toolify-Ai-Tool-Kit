
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';

type SchemaType = 'faq' | 'article' | 'product';

export function SchemaGenerator() {
    const [schemaType, setSchemaType] = useState<SchemaType>('faq');
    const [faqItems, setFaqItems] = useState([{ question: '', answer: '' }]);
    const [generatedSchema, setGeneratedSchema] = useState('');
    const { toast } = useToast();

    const handleGenerate = () => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        };
        setGeneratedSchema(JSON.stringify(schema, null, 2));
    };

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newItems = [...faqItems];
        newItems[index][field] = value;
        setFaqItems(newItems);
    };
    
    const addFaqItem = () => setFaqItems([...faqItems, { question: '', answer: '' }]);
    const removeFaqItem = (index: number) => setFaqItems(faqItems.filter((_, i) => i !== index));
    const handleCopy = () => { navigator.clipboard.writeText(generatedSchema); toast({ title: "Schema copied!"}); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Select value={schemaType} onValueChange={val => setSchemaType(val as SchemaType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="faq">FAQ Schema</SelectItem><SelectItem value="article" disabled>Article Schema (Coming Soon)</SelectItem><SelectItem value="product" disabled>Product Schema (Coming Soon)</SelectItem></SelectContent>
                </Select>
                {schemaType === 'faq' && (
                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <div key={index} className="p-4 border rounded-md space-y-2 relative">
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFaqItem(index)}><Trash2 className="h-4 w-4"/></Button>
                                <Input placeholder={`Question ${index + 1}`} value={item.question} onChange={e => handleFaqChange(index, 'question', e.target.value)} />
                                <Textarea placeholder={`Answer ${index + 1}`} value={item.answer} onChange={e => handleFaqChange(index, 'answer', e.target.value)} />
                            </div>
                        ))}
                        <Button variant="outline" onClick={addFaqItem}><PlusCircle className="mr-2 h-4 w-4"/>Add FAQ Item</Button>
                    </div>
                )}
                 <Button onClick={handleGenerate} className="w-full">Generate Schema</Button>
            </div>
             <div className="space-y-2">
                <Label>Generated JSON-LD</Label>
                <Textarea value={generatedSchema} readOnly className="min-h-[400px] bg-muted font-mono" />
                <Button onClick={handleCopy} disabled={!generatedSchema}><Copy className="mr-2 h-4 w-4"/>Copy Schema</Button>
            </div>
        </div>
    );
}
