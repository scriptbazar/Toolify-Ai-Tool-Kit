
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
  expiryDate: Date;
  onTimerEnd?: () => void;
  className?: string;
  expiredClassName?: string;
  expiredText?: React.ReactNode;
  children: (timeLeft: TimeLeft) => React.ReactNode;
}

export function CountdownTimer({
  expiryDate,
  onTimerEnd,
  className,
  expiredClassName,
  expiredText = "Expired",
  children
}: CountdownTimerProps) {
    const calculateTimeLeft = (): TimeLeft | null => {
        const difference = +new Date(expiryDate) - +new Date();
        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return null;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());

    useEffect(() => {
        if (!timeLeft) {
          if (onTimerEnd) {
            onTimerEnd();
          }
          return;
        }

        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onTimerEnd]);


    if (!timeLeft) {
        return <span className={cn(expiredClassName)}>{expiredText}</span>;
    }

    return (
        <div className={cn(className)}>
           {children(timeLeft)}
        </div>
    );
};
