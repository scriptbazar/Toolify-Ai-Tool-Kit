
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { generatePrompt } from '@/ai/flows/prompt-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function PromptGenerator() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Image');
  const [detailLevel, setDetailLevel] = useState('Detailed');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic or keywords to generate a prompt.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedPrompt('');
    try {
      const result = await generatePrompt({ topic, category: category as any, detailLevel: detailLevel as any });
      setGeneratedPrompt(result.prompt);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate a prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: 'Prompt copied to clipboard!'});
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic-input">Topic or Keywords</Label>
        <Textarea
          id="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., a futuristic city, a magical forest, a healthy breakfast recipe"
          className="min-h-[100px]"
        />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="category-select">Prompt Category</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="App">App</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="detail-level-select">Prompt Detail Level</Label>
             <Select value={detailLevel} onValueChange={setDetailLevel}>
                <SelectTrigger id="detail-level-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Detailed">Detailed</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>


      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Advanced Prompt
      </Button>

      {(generatedPrompt || isLoading) && (
        <div className="pt-4 border-t">
          <Label>Generated Prompt</Label>
          <Card className="mt-2">
            <CardContent className="p-4 relative">
                {isLoading ? (
                     <div className="flex items-center justify-center min-h-[100px]">
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <>
                    <p className="text-muted-foreground whitespace-pre-wrap">{generatedPrompt}</p>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                        <Copy className="h-4 w-4"/>
                    </Button>
                    </>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
