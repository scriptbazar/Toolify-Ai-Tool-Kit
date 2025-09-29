
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Gift, Sparkles, Clock, PartyPopper } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, addYears, add, differenceInMilliseconds, isValid, parse, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import ReactConfetti from 'react-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        
        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const CakeWithCandles = ({ age }: { age: number }) => {
    const candles = Array.from({ length: age > 0 ? age : 1 }, (_, i) => i);
    const candleWidth = 4;
    const candleSpacing = age > 20 ? 3 : (age > 10 ? 4 : 6);
    const totalCandleWidth = (candles.length * (candleWidth + candleSpacing)) - candleSpacing;
    const startX = (200 - totalCandleWidth) / 2;

    return (
        <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" className="w-64 h-auto">
            {/* Candles */}
            {candles.map((_, i) => (
                <g key={i}>
                    <rect x={startX + i * (candleWidth + candleSpacing)} y="40" width={candleWidth} height="20" rx="1" className="fill-primary" />
                    <path d={`M ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2},40 Q ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2},35 ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2 - 1},30 C ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2 - 3},25 ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2 + 1},25 ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2},30 Q ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2},35 ${startX + i * (candleWidth + candleSpacing) + candleWidth / 2},40`} className="fill-yellow-300" />
                </g>
            ))}
            {/* Cake */}
            <rect x="10" y="60" width="180" height="80" rx="8" className="fill-pink-300 dark:fill-pink-800" />
            <rect x="20" y="80" width="160" height="50" fill="rgba(255,255,255,0.5)" />
            <rect x="0" y="140" width="200" height="10" rx="5" className="fill-gray-200 dark:fill-gray-700" />
        </svg>
    )
  }


export function AgeCalculator() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number; milliseconds: number; } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [isBirthdayExplosion, setIsBirthdayExplosion] = useState(false);
  const { width, height } = useWindowSize();


  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsedDate = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate) && year.length === 4 && parseInt(year, 10) > 1900 && parsedDate < new Date()) {
      setDateOfBirth(parsedDate);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      const today = new Date();
      if (isSameDay(parsedDate, today)) {
        setIsBirthday(true);
      } else {
        setIsBirthday(false);
      }

    } else {
      setDateOfBirth(undefined);
      setIsBirthday(false);
    }
  }, [day, month, year]);

  useEffect(() => {
    if (dateOfBirth) {
        const calculateAge = () => {
            const nowForCalc = new Date();
            if (dateOfBirth > nowForCalc) {
                setAge(null);
                return;
            }
            
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
        
        calculateAge();
        const interval = setInterval(calculateAge, 100);

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

  const handleBirthdayExplosion = () => {
    setIsBirthdayExplosion(true);
    setTimeout(() => {
        setIsBirthdayExplosion(false);
        setIsBirthday(false);
    }, 8000);
  };

  const nextBdayInfo = nextBirthday();
  
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDay(value);
    if (value.length === 2) {
      monthInputRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMonth(value);
    if (value.length === 2) {
      yearInputRef.current?.focus();
    }
  };
  
  return (
    <>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.1} initialVelocityY={-10} />}
      {isBirthdayExplosion && <ReactConfetti width={width} height={height} numberOfPieces={500} recycle={false} gravity={0.2} />}

       <Dialog open={isBirthday} onOpenChange={setIsBirthday}>
        <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
                <DialogTitle className="text-2xl">Happy Birthday!</DialogTitle>
                <DialogDescription>
                    Wishing you a fantastic day filled with joy and happiness.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center my-4 relative">
               <CakeWithCandles age={age?.years || 0} />
               <div 
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                 onClick={handleBirthdayExplosion}
               >
                   <span className="text-7xl font-bold text-white [text-shadow:0_0_10px_rgba(0,0,0,0.5),0_0_20px_hsl(var(--primary))] group-hover:scale-110 transition-transform">{age?.years}</span>
                   <p className="text-xs text-white/90 animate-pulse font-semibold [text-shadow:0_0_5px_black]">Click my age!</p>
               </div>
            </div>
        </DialogContent>
      </Dialog>

    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Enter your Date of Birth
        </label>
         <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
                <Label htmlFor="day-input">Day</Label>
                <Input id="day-input" type="number" placeholder="DD" value={day} onChange={handleDayChange} min="1" max="31" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="month-input">Month</Label>
                <Input ref={monthInputRef} id="month-input" type="number" placeholder="MM" value={month} onChange={handleMonthChange} min="1" max="12" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="year-input">Year</Label>
                <Input ref={yearInputRef} id="year-input" type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} min="1900" max={new Date().getFullYear()} />
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
    </>
  );
}
