
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Gift, Sparkles, Clock } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, add } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CountdownTimer } from '@/components/common/CountdownTimer';


export function AgeCalculator() {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);

  useEffect(() => {
    if (dateOfBirth) {
        const now = new Date();
        if (dateOfBirth > now) {
            setAge(null); // Don't calculate for future dates
            return;
        }

        const years = differenceInYears(now, dateOfBirth);
        const dateAfterYears = addYears(dateOfBirth, years);
        
        const months = differenceInMonths(now, dateAfterYears);
        const dateAfterMonths = addYears(add(dateOfBirth, { months }), years);

        const days = differenceInDays(now, dateAfterMonths);

        setAge({ years, months, days });
    } else {
        setAge(null);
    }
  }, [dateOfBirth]);
  
  const nextBirthday = () => {
    if (!dateOfBirth) return null;
    const now = new Date();
    let nextBday = new Date(now.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    if (now > nextBday) {
        nextBday.setFullYear(now.getFullYear() + 1);
    }
    return { date: format(nextBday, 'PPP'), daysLeft: differenceInDays(nextBday, now), nextBdayDate: nextBday };
  };

  const nextBdayInfo = nextBirthday();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Select your Date of Birth
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal h-12 text-base",
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
              defaultMonth={dateOfBirth}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {age && (
        <Card className="mt-6 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your Age Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">You are</p>
                <div className="flex justify-center items-baseline gap-4 mt-2">
                    <div>
                        <span className="text-5xl font-bold text-primary">{age.years}</span>
                        <span className="text-muted-foreground"> years</span>
                    </div>
                     <div>
                        <span className="text-5xl font-bold text-primary">{age.months}</span>
                        <span className="text-muted-foreground"> months</span>
                    </div>
                     <div>
                        <span className="text-5xl font-bold text-primary">{age.days}</span>
                        <span className="text-muted-foreground"> days</span>
                    </div>
                </div>
                <p className="text-muted-foreground mt-2">old.</p>
             </div>
             <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-center gap-4">
                <Gift className="h-8 w-8 text-primary" />
                <div>
                   <p className="font-semibold">Next Birthday</p>
                   {nextBdayInfo && (
                       <p className="text-muted-foreground">{nextBdayInfo.date} ({nextBdayInfo.daysLeft} days left)</p>
                   )}
                </div>
            </div>
            {nextBdayInfo && (
              <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-center">
                 <CountdownTimer expiryDate={nextBdayInfo.nextBdayDate} className="flex space-x-4">
                    {(timeLeft) => (
                      <>
                        <div className="text-center"><div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div><div className="text-xs">Days</div></div>
                        <div className="text-center"><div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div><div className="text-xs">Hours</div></div>
                        <div className="text-center"><div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div><div className="text-xs">Minutes</div></div>
                        <div className="text-center"><div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div><div className="text-xs">Seconds</div></div>
                      </>
                    )}
                  </CountdownTimer>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
