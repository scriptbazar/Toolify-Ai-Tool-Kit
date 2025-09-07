
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

export function AiProductDescriptionWriter() {
  const [productName, setProductName] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !keyFeatures.trim()) {
      toast({
        title: 'Fields are required',
        description: 'Please provide a product name and key features.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedDescription('');
    try {
      const result = await generateProductDescription({
        productName,
        keyFeatures,
        targetAudience: targetAudience || 'general consumers',
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
    navigator.clipboard.writeText(generatedDescription);
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
            placeholder="e.g., Smart Mug 2.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-audience">Target Audience</Label>
          <Input
            id="target-audience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Tech enthusiasts, busy professionals"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="key-features">Key Features & Benefits</Label>
        <Textarea
          id="key-features"
          value={keyFeatures}
          onChange={(e) => setKeyFeatures(e.target.value)}
          placeholder="- Keeps drinks at the perfect temperature&#10;- Controlled via a mobile app&#10;- 3-hour battery life"
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">Enter one feature per line.</p>
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
                <p className="text-muted-foreground whitespace-pre-wrap">{generatedDescription}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
