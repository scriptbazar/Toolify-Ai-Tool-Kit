
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { aiWriter } from '@/ai/flows/ai-writer';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Portuguese', label: 'Portuguese' },
];

export function AiBlogPostWriter() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('Medium');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [customWordCount, setCustomWordCount] = useState(2000);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic to generate a blog post.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedContent('');
    try {
      const result = await aiWriter({ 
          topic, 
          length: length as any, 
          tone: tone as any,
          language,
          wordCount: length === 'Ultra Long' ? customWordCount : undefined,
      });
      setGeneratedContent(result.content);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate a blog post.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHtml = () => {
    if (!generatedContent) {
        toast({ title: 'Nothing to copy!', variant: 'destructive'});
        return;
    }
    navigator.clipboard.writeText(generatedContent);
    toast({ title: 'HTML content copied to clipboard!'});
  };

  const handleCopyText = () => {
    if (!generatedContent) {
      toast({ title: 'Nothing to copy!', variant: 'destructive' });
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(textContent);
    toast({ title: 'Text content copied to clipboard!' });
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="topic-input">Blog Post Topic</Label>
            <Input
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Future of Renewable Energy"
            />
        </div>
         <div className="space-y-2">
            <Label htmlFor="language-select">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
           <div className="space-y-2">
            <Label htmlFor="length-select">Post Length</Label>
            <Select value={length} onValueChange={setLength}>
                <SelectTrigger id="length-select">
                    <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Short">Short (~300 words)</SelectItem>
                    <SelectItem value="Medium">Medium (~700 words)</SelectItem>
                    <SelectItem value="Long">Long (~1200+ words)</SelectItem>
                    <SelectItem value="Ultra Long">Ultra Long (Custom)</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {length === 'Ultra Long' && (
              <div className="space-y-2">
                <Label htmlFor="word-count-input">Word Count</Label>
                <Input
                    id="word-count-input"
                    type="number"
                    value={customWordCount}
                    onChange={(e) => setCustomWordCount(Number(e.target.value))}
                    placeholder="e.g., 2000"
                    step="100"
                />
              </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tone-select">Tone of Voice</Label>
            <Select value={tone} onValueChange={setTone}>
                 <SelectTrigger id="tone-select">
                    <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Informative">Informative</SelectItem>
                    <SelectItem value="Engaging">Engaging</SelectItem>
                    <SelectItem value="Humorous">Humorous</SelectItem>
                    <SelectItem value="Persuasive">Persuasive</SelectItem>
                    <SelectItem value="Inspirational">Inspirational</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Storytelling">Storytelling</SelectItem>
                </SelectContent>
            </Select>
          </div>
       </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Generate Post
      </Button>

      {(generatedContent || isLoading) && (
        <div className="pt-4 border-t">
          <Label>Generated Blog Post</Label>
          <Card className="mt-2">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Preview</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyText}>
                            <FileText className="mr-2 h-4 w-4"/>
                            Copy Text
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Copy HTML
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="space-y-4">
                        <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                ) : (
                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
