
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { generateProductDescription } from '@/ai/flows/ai-writer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AiProductDescriptionWriter() {
  const [productName, setProductName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Persuasive');
  const [format, setFormat] = useState('Paragraph with Bullets');
  const [keywords, setKeywords] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast({
        title: 'Product Name is required',
        description: 'Please provide a product name for the AI to search for.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedDescription('');
    try {
      const result = await generateProductDescription({
        productName,
        targetAudience: targetAudience || 'general consumers',
        tone: tone as any,
        format: format as any,
        targetKeywords: keywords,
      });
      setGeneratedDescription(result.description);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate the description.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDescription) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
     // To copy the text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedDescription;
    navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || "");
    toast({ title: 'Description copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Sony WH-1000XM5 Headphones"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-audience">Target Audience</Label>
          <Input
            id="target-audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Tech enthusiasts, audiophiles, frequent travelers"
          />
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone-select">Tone of Voice</Label>
            <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Persuasive">Persuasive</SelectItem>
                    <SelectItem value="Playful">Playful</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="format-select">Description Format</Label>
            <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Paragraph with Bullets">Paragraph with Bullets</SelectItem>
                    <SelectItem value="Paragraph Only">Paragraph Only</SelectItem>
                    <SelectItem value="Bulleted List Only">Bulleted List Only</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords (Optional)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., noise cancelling, bluetooth headset"
              />
          </div>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Description
      </Button>

      {(generatedDescription || isLoading) && (
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <Label>Generated Product Description</Label>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedDescription}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <Card className="mt-2">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <div 
                    className="prose dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: generatedDescription }} 
                 />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
