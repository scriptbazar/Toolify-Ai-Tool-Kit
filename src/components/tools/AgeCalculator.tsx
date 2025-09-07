
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Calculator, Gift, Sparkles } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function AgeCalculator() {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAge = () => {
    if (!dateOfBirth) return;
    
    const now = new Date();
    const years = differenceInYears(now, dateOfBirth);
    const months = differenceInMonths(now, dateOfBirth) % 12;
    // A simplified day calculation
    const days = differenceInDays(now, new Date(now.getFullYear(), now.getMonth(), dateOfBirth.getDate())) % 30;

    setAge({ years, months, days });
  };
  
  const nextBirthday = () => {
    if (!dateOfBirth) return null;
    const now = new Date();
    let nextBday = new Date(now.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    if (now > nextBday) {
        nextBday.setFullYear(now.getFullYear() + 1);
    }
    const daysLeft = differenceInDays(nextBday, now);
    return { date: format(nextBday, 'PPP'), daysLeft };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select your Date of Birth</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={setDateOfBirth}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={calculateAge} disabled={!dateOfBirth} className="w-full">
        <Calculator className="mr-2 h-4 w-4" /> Calculate Age
      </Button>

      {age && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Age</CardTitle>
            <CardDescription>Here is your calculated age based on the selected date.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-4xl font-bold text-primary">{age.years}</p>
              <p className="text-sm text-muted-foreground">Years</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-4xl font-bold text-primary">{age.months}</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </div>
             <div className="p-4 bg-muted rounded-lg">
              <p className="text-4xl font-bold text-primary">{age.days}</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </div>
             <div className="col-span-3 p-4 bg-primary/10 rounded-lg flex items-center justify-center gap-4">
                <Gift className="h-8 w-8 text-primary" />
                <div>
                   <p className="font-semibold">Next Birthday</p>
                   {nextBirthday() && (
                       <p className="text-muted-foreground">{nextBirthday()?.date} ({nextBirthday()?.daysLeft} days left)</p>
                   )}
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
