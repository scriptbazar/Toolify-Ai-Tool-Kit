
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Minus, Calculator } from 'lucide-react';
import { format, add, sub, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function DateCalculator() {
    const [addSubtractDate, setAddSubtractDate] = useState<Date | undefined>(new Date());
    const [resultDate, setResultDate] = useState<string | null>(null);
    const [days, setDays] = useState('0');
    const [months, setMonths] = useState('0');
    const [years, setYears] = useState('0');
    
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState<{ years: number; months: number; days: number; } | null>(null);

    const handleAdd = () => {
        if (!addSubtractDate) return;
        let date = add(addSubtractDate, {
            days: parseInt(days) || 0,
            months: parseInt(months) || 0,
            years: parseInt(years) || 0
        });
        setResultDate(format(date, "PPP"));
    };
    
    const handleSubtract = () => {
        if (!addSubtractDate) return;
        let date = sub(addSubtractDate, {
            days: parseInt(days) || 0,
            months: parseInt(months) || 0,
            years: parseInt(years) || 0
        });
        setResultDate(format(date, "PPP"));
    };

    const handleCalculateDuration = () => {
        if (!startDate || !endDate) return;
        const totalDays = differenceInDays(endDate, startDate);
        const years = differenceInYears(endDate, startDate);
        const months = differenceInMonths(endDate, startDate) % 12;
        const remainingDays = differenceInDays(endDate, add(startDate, { years, months }));
        setDuration({ years, months, days: remainingDays });
    };

  return (
    <Tabs defaultValue="add-subtract" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="add-subtract">Add/Subtract Date</TabsTrigger>
        <TabsTrigger value="duration">Calculate Duration</TabsTrigger>
      </TabsList>
      <TabsContent value="add-subtract">
        <div className="space-y-6 pt-4">
             <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !addSubtractDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {addSubtractDate ? format(addSubtractDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={addSubtractDate} onSelect={setAddSubtractDate} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Years</Label><Input type="number" value={years} onChange={(e) => setYears(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Months</Label><Input type="number" value={months} onChange={(e) => setMonths(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Days</Label><Input type="number" value={days} onChange={(e) => setDays(e.target.value)} /></div>
              </div>
              <div className="flex gap-4">
                  <Button onClick={handleSubtract} className="w-full"><Minus className="mr-2 h-4 w-4"/> Subtract</Button>
                  <Button onClick={handleAdd} className="w-full"><Plus className="mr-2 h-4 w-4"/> Add</Button>
              </div>
              {resultDate && (
                <Card><CardHeader><CardTitle>Resulting Date</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{resultDate}</p></CardContent></Card>
              )}
        </div>
      </TabsContent>
      <TabsContent value="duration">
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent></Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent></Popover>
            </div>
          </div>
          <Button onClick={handleCalculateDuration} className="w-full"><Calculator className="mr-2 h-4 w-4"/> Calculate Duration</Button>
          {duration && (
            <Card><CardHeader><CardTitle>Duration</CardTitle></CardHeader><CardContent><p className="text-xl">{duration.years} years, {duration.months} months, and {duration.days} days</p></CardContent></Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
