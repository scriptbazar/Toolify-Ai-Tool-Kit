
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Timer } from 'lucide-react';
import { format } from 'date-fns';

export function UnixTimestampConverter() {
    const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
    const [readableDate, setReadableDate] = useState(new Date().toUTCString());

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [convertedTimestamp, setConvertedTimestamp] = useState(Math.floor(Date.now() / 1000).toString());

    const convertToDate = () => {
        const num = parseInt(timestamp, 10);
        if (isNaN(num)) return;
        // Check if it's in seconds or milliseconds
        const dateObj = new Date(num * (timestamp.length === 10 ? 1000 : 1));
        setReadableDate(dateObj.toUTCString());
    };

    const convertToTimestamp = (selectedDate?: Date) => {
        const d = selectedDate || date;
        if (!d) return;
        setConvertedTimestamp(Math.floor(d.getTime() / 1000).toString());
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Timestamp to Date</h3>
                <div className="space-y-2">
                    <Label htmlFor="timestamp">Unix Timestamp</Label>
                    <Input id="timestamp" value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="e.g., 1672531199"/>
                </div>
                <Button onClick={convertToDate} className="w-full">Convert to Date</Button>
                {readableDate && <div className="p-2 bg-muted rounded-md text-center font-mono">{readableDate}</div>}
            </div>
             <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Date to Timestamp</h3>
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
                <Button onClick={() => convertToTimestamp()} className="w-full">Convert to Timestamp</Button>
                {convertedTimestamp && <div className="p-2 bg-muted rounded-md text-center font-mono">{convertedTimestamp}</div>}
            </div>
        </div>
    );
}
