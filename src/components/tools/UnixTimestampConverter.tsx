
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Timer, ArrowRightLeft, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function UnixTimestampConverter() {
    const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
    const [readableDate, setReadableDate] = useState(new Date().toUTCString());
    const [isMilliseconds, setIsMilliseconds] = useState(false);

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [convertedTimestamp, setConvertedTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
    
    const { toast } = useToast();
    
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000).toString();
            if (document.activeElement?.id !== 'timestamp-input') {
                setTimestamp(now);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        convertToDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timestamp]);

    const convertToDate = () => {
        const num = parseInt(timestamp, 10);
        if (isNaN(num)) {
            setReadableDate('Invalid Timestamp');
            return;
        };
        // Auto-detect if it's seconds (10 digits) or milliseconds (13 digits)
        const inMilliseconds = timestamp.length > 10;
        setIsMilliseconds(inMilliseconds);
        const dateObj = new Date(num * (inMilliseconds ? 1 : 1000));
        setReadableDate(dateObj.toUTCString());
    };

    const convertToTimestamp = (selectedDate?: Date | undefined) => {
        const d = selectedDate || date;
        if (!d) return;
        setConvertedTimestamp(Math.floor(d.getTime() / 1000).toString());
    };
    
    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `Copied ${fieldName}!` });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 p-6 border rounded-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Timer className="h-5 w-5 text-primary"/>Timestamp to Date</h3>
                <div className="space-y-2">
                    <Label htmlFor="timestamp-input">Unix Timestamp</Label>
                    <div className="relative">
                        <Input id="timestamp-input" value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="e.g., 1672531199"/>
                         <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => handleCopy(timestamp, 'Timestamp')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <div className="p-4 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">UTC Date</p>
                    <p className="font-mono text-lg font-semibold text-primary break-all">{readableDate}</p>
                 </div>
                 <div className="text-xs text-center text-muted-foreground">
                    {isMilliseconds ? 'Milliseconds detected' : 'Seconds detected'}
                 </div>
            </div>
             <div className="space-y-4 p-6 border rounded-lg">
                <h3 className="font-semibold text-lg flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary"/>Date to Timestamp</h3>
                <div className="space-y-2">
                     <Label>Select Date</Label>
                     <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); convertToTimestamp(d); }} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                 <div className="p-4 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Unix Timestamp (seconds)</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="font-mono text-lg font-semibold text-primary">{convertedTimestamp}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(convertedTimestamp, 'Timestamp')}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
            </div>
        </div>
    );
}
