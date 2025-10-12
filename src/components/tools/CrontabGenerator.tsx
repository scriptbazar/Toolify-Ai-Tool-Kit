
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Copy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import cronstrue from 'cronstrue';

export function CrontabGenerator() {
    const [minute, setMinute] = useState('*');
    const [hour, setHour] = useState('*');
    const [dayOfMonth, setDayOfMonth] = useState('*');
    const [month, setMonth] = useState('*');
    const [dayOfWeek, setDayOfWeek] = useState('*');
    const [cronExpression, setCronExpression] = useState('* * * * *');
    const [humanReadable, setHumanReadable] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        setCronExpression(expression);
        try {
            setHumanReadable(cronstrue.toString(expression));
        } catch (e) {
            setHumanReadable('Invalid cron expression');
        }
    }, [minute, hour, dayOfMonth, month, dayOfWeek]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(cronExpression);
        toast({ title: "Cron expression copied!" });
    };

    const createOptions = (max: number, start = 0) => Array.from({ length: max - start + 1 }, (_, i) => String(i + start));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cron Job Scheduler</CardTitle>
                    <CardDescription>Use the fields below to build your cron expression.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-2"><Label>Minute</Label><Select value={minute} onValueChange={setMinute}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="*">Every Minute</SelectItem>{createOptions(59).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Hour</Label><Select value={hour} onValueChange={setHour}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="*">Every Hour</SelectItem>{createOptions(23).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Day of Month</Label><Select value={dayOfMonth} onValueChange={setDayOfMonth}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="*">Every Day</SelectItem>{createOptions(31, 1).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Month</Label><Select value={month} onValueChange={setMonth}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="*">Every Month</SelectItem>{createOptions(12, 1).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Day of Week</Label><Select value={dayOfWeek} onValueChange={setDayOfWeek}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="*">Every Day</SelectItem>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}</SelectContent></Select></div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Generated Expression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="relative">
                        <Input value={cronExpression} readOnly className="font-mono h-12 text-lg pr-12 bg-muted"/>
                        <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={handleCopy}><Copy className="h-5 w-5"/></Button>
                     </div>
                     <div className="p-4 bg-primary/10 rounded-md text-center">
                        <p className="font-semibold text-primary">{humanReadable}</p>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
