
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Gift, Sparkles, Clock } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, add, differenceInMilliseconds, isValid, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CountdownTimer } from '@/components/common/CountdownTimer';


export function AgeCalculator() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number; milliseconds: number; } | null>(null);

  useEffect(() => {
    const parsedDate = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate) && year.length === 4 && parseInt(year, 10) > 1900 && parsedDate < new Date()) {
      setDateOfBirth(parsedDate);
    } else {
      setDateOfBirth(undefined);
    }
  }, [day, month, year]);

  useEffect(() => {
    if (dateOfBirth) {
        const now = new Date();
        if (dateOfBirth > now) {
            setAge(null); // Don't calculate for future dates
            return;
        }

        const calculateAge = () => {
            const nowForCalc = new Date();
            const years = differenceInYears(nowForCalc, dateOfBirth);
            const dateAfterYears = addYears(dateOfBirth, years);
            
            const months = differenceInMonths(nowForCalc, dateAfterYears);
            const dateAfterMonths = add(dateAfterYears, { months });

            const days = differenceInDays(nowForCalc, dateAfterMonths);
            const dateAfterDays = add(dateAfterMonths, { days });

            const remainingMilliseconds = differenceInMilliseconds(nowForCalc, dateAfterDays);
            
            const hours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
            const milliseconds = remainingMilliseconds % 1000;

            setAge({ years, months, days, hours, minutes, seconds, milliseconds });
        };
        
        calculateAge(); // Initial calculation
        const interval = setInterval(calculateAge, 100); // Update frequently for live milliseconds

        return () => clearInterval(interval);
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
            Enter your Date of Birth
        </label>
         <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
                <Label htmlFor="day-input">Day</Label>
                <Input id="day-input" type="number" placeholder="DD" value={day} onChange={(e) => setDay(e.target.value)} min="1" max="31" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="month-input">Month</Label>
                <Input id="month-input" type="number" placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value)} min="1" max="12" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="year-input">Year</Label>
                <Input id="year-input" type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} min="1900" max={new Date().getFullYear()} />
            </div>
        </div>
      </div>

      {age && dateOfBirth && (
        <Card className="mt-6 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your Age Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground text-center">You are</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.years}</span><span className="text-muted-foreground"> years</span></div>
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.months}</span><span className="text-muted-foreground"> months</span></div>
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.days}</span><span className="text-muted-foreground"> days</span></div>
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.hours}</span><span className="text-muted-foreground"> hours</span></div>
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.minutes}</span><span className="text-muted-foreground"> minutes</span></div>
                    <div className="text-center"><span className="text-3xl font-bold text-primary">{age.seconds}</span><span className="text-muted-foreground"> seconds</span></div>
                    <div className="text-center col-span-2 md:col-span-1"><span className="text-3xl font-bold text-primary">{age.milliseconds}</span><span className="text-muted-foreground"> ms</span></div>
                </div>
                <p className="text-muted-foreground mt-2 text-center">old!</p>
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
