
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Download, RefreshCw, Trash2, PlusCircle, Shield, ShieldOff, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Rule {
    type: 'Allow' | 'Disallow';
    path: string;
}

interface UserAgentBlock {
    userAgent: string;
    rules: Rule[];
}

export function RobotsTxtGenerator() {
    const [defaultPolicy, setDefaultPolicy] = useState<'allow' | 'block' | 'custom'>('allow');
    const [userAgentBlocks, setUserAgentBlocks] = useState<UserAgentBlock[]>([
        { userAgent: '*', rules: [{ type: 'Disallow', path: '' }] },
    ]);
    const [sitemapUrl, setSitemapUrl] = useState('');
    const [generatedRobotsTxt, setGeneratedRobotsTxt] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        let txt = '';
        userAgentBlocks.forEach(block => {
            txt += `User-agent: ${block.userAgent}\n`;
            block.rules.forEach(rule => {
                txt += `${rule.type}: ${rule.path}\n`;
            });
            txt += '\n';
        });
        if (sitemapUrl) {
            txt += `Sitemap: ${sitemapUrl}\n`;
        }
        setGeneratedRobotsTxt(txt.trim());
    }, [userAgentBlocks, sitemapUrl]);
    
    useEffect(() => {
        if(defaultPolicy === 'allow') {
            setUserAgentBlocks([{ userAgent: '*', rules: [{ type: 'Disallow', path: '' }] }]);
        } else if (defaultPolicy === 'block') {
             setUserAgentBlocks([{ userAgent: '*', rules: [{ type: 'Disallow', path: '/' }] }]);
        }
    }, [defaultPolicy]);

    const handleUserAgentChange = (index: number, value: string) => {
        const newBlocks = [...userAgentBlocks];
        newBlocks[index].userAgent = value;
        setUserAgentBlocks(newBlocks);
    };

    const handleRuleChange = (blockIndex: number, ruleIndex: number, field: 'type' | 'path', value: string) => {
        const newBlocks = [...userAgentBlocks];
        (newBlocks[blockIndex].rules[ruleIndex] as any)[field] = value;
        setUserAgentBlocks(newBlocks);
    };

    const addRule = (blockIndex: number) => {
        const newBlocks = [...userAgentBlocks];
        newBlocks[blockIndex].rules.push({ type: 'Disallow', path: '/' });
        setUserAgentBlocks(newBlocks);
    };
    
    const removeRule = (blockIndex: number, ruleIndex: number) => {
        const newBlocks = [...userAgentBlocks];
        newBlocks[blockIndex].rules.splice(ruleIndex, 1);
        setUserAgentBlocks(newBlocks);
    };
    
     const addUserAgentBlock = () => {
        setUserAgentBlocks([...userAgentBlocks, { userAgent: 'Googlebot', rules: [{ type: 'Disallow', path: '/private/' }] }]);
        setDefaultPolicy('custom');
    };
    
    const removeUserAgentBlock = (index: number) => {
        if (userAgentBlocks.length > 1) {
            setUserAgentBlocks(userAgentBlocks.filter((_, i) => i !== index));
        } else {
            toast({ title: 'Cannot remove the last block', variant: 'destructive' });
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedRobotsTxt);
        toast({ title: "Robots.txt content copied!" });
    };

    const handleDownload = () => {
        const blob = new Blob([generatedRobotsTxt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'robots.txt';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
           <Card>
            <CardHeader>
                <CardTitle>Robots.txt Builder</CardTitle>
                 <CardDescription>Create rules for search engine crawlers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Default Policy</Label>
                    <div className="grid grid-cols-2 gap-2">
                       <Button variant={defaultPolicy === 'allow' ? 'default' : 'outline'} onClick={() => setDefaultPolicy('allow')} className="flex items-center gap-2"><ShieldOff/>Allow All</Button>
                       <Button variant={defaultPolicy === 'block' ? 'default' : 'outline'} onClick={() => setDefaultPolicy('block')} className="flex items-center gap-2"><Shield/>Block All</Button>
                    </div>
                </div>

                {userAgentBlocks.map((block, blockIndex) => (
                    <div key={blockIndex} className="p-4 border rounded-lg space-y-4 relative">
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeUserAgentBlock(blockIndex)}><Trash2 className="h-4 w-4"/></Button>
                        <div className="space-y-2">
                            <Label htmlFor={`user-agent-${blockIndex}`} className="flex items-center gap-2"><Bot/>User-agent</Label>
                            <Input id={`user-agent-${blockIndex}`} value={block.userAgent} onChange={e => handleUserAgentChange(blockIndex, e.target.value)} />
                        </div>
                        {block.rules.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="flex gap-2 items-end">
                                <div className="w-1/3">
                                    <Label>Rule</Label>
                                    <Select value={rule.type} onValueChange={val => handleRuleChange(blockIndex, ruleIndex, 'type', val)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent><SelectItem value="Allow">Allow</SelectItem><SelectItem value="Disallow">Disallow</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label>Path</Label>
                                    <Input value={rule.path} onChange={e => handleRuleChange(blockIndex, ruleIndex, 'path', e.target.value)} placeholder="/private/"/>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeRule(blockIndex, ruleIndex)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => addRule(blockIndex)}><PlusCircle className="mr-2 h-4 w-4"/>Add Rule</Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addUserAgentBlock} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4"/>Add User-agent Section
                </Button>
                 <div className="space-y-2">
                    <Label htmlFor="sitemap-url">Sitemap URL (optional)</Label>
                    <Input id="sitemap-url" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="https://your-domain.com/sitemap.xml"/>
                </div>
            </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle>Generated robots.txt</CardTitle>
                <div className="flex justify-end gap-2">
                     <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedRobotsTxt}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                     <Button variant="outline" size="sm" onClick={handleDownload} disabled={!generatedRobotsTxt}><Download className="mr-2 h-4 w-4"/>Download</Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Textarea 
                    value={generatedRobotsTxt}
                    readOnly 
                    className="min-h-[400px] font-mono bg-muted"
                    placeholder="Your robots.txt content will appear here..."
                 />
            </CardContent>
           </Card>
        </div>
    );
}
