
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Code, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function MetaTagGenerator() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { toast } = useToast();

    const metaTags = `<title>${title}</title>\n<meta name="description" content="${description}">`;

    const handleCopy = () => {
        navigator.clipboard.writeText(metaTags);
        toast({ title: "Meta tags copied to clipboard!" });
    };
    
    const handleReset = () => {
        setTitle('');
        setDescription('');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Site Title (max 60 chars)</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Meta Description (max 160 chars)</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} maxLength={160}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="meta-code">Generated Meta Tags</Label>
                    <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto"><code id="meta-code">{metaTags}</code></pre>
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/> Copy Code</Button>
                    <Button onClick={handleReset} variant="destructive"><RefreshCw className="mr-2 h-4 w-4"/> Reset</Button>
                </div>
            </div>
            <div>
                 <Label>SERP Preview</Label>
                 <Card className="mt-2">
                    <CardContent className="p-4">
                        <p className="text-blue-700 text-xl truncate">{title || "Your Title Will Appear Here"}</p>
                        <p className="text-green-600 text-sm">https://yourwebsite.com/your-page</p>
                        <p className="text-gray-600 text-sm mt-1">{description || "Your meta description will appear here, providing a brief summary of your page's content for search engine users."}</p>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
