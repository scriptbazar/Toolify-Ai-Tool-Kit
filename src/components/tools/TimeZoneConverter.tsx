
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '../ui/card';
import { Clock, PlusCircle, Trash2, Globe } from 'lucide-react';
import { timezones } from '@/lib/timezones';
import { Combobox } from '../ui/combobox';

interface SelectedTimeZone {
  id: string;
  name: string;
}

const formatTime = (date: Date, timeZone: string) => {
    try {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timeZone,
            hour12: true,
        }).format(date);
    } catch (e) {
        console.error(`Invalid time zone: ${timeZone}`);
        return "Invalid Time";
    }
};

const formatDate = (date: Date, timeZone: string) => {
     try {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: timeZone,
        }).format(date);
    } catch (e) {
        return "Invalid Date";
    }
};

export function TimeZoneConverter() {
    const [baseDate, setBaseDate] = useState(new Date());
    const [selectedTimezones, setSelectedTimezones] = useState<SelectedTimeZone[]>([
        { id: 'America/New_York', name: 'New York (EST)' },
        { id: 'Europe/London', name: 'London (GMT)' },
        { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
    ]);
    
    const timezoneOptions = useMemo(() => 
        timezones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') })), 
    [timezones]);


    useEffect(() => {
        const timer = setInterval(() => setBaseDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const addTimezone = (tzId: string) => {
        if (tzId && !selectedTimezones.some(t => t.id === tzId)) {
            setSelectedTimezones([...selectedTimezones, { id: tzId, name: tzId.replace(/_/g, ' ') }]);
        }
    };
    
    const removeTimezone = (index: number) => {
        setSelectedTimezones(selectedTimezones.filter((_, i) => i !== index));
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 space-y-4">
                    {selectedTimezones.map((tz, index) => (
                        <div key={index} className="grid grid-cols-[1fr,auto] items-center gap-4">
                            <div className="border p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-lg">{tz.name}</p>
                                    <p className="text-2xl font-bold text-primary">{formatTime(baseDate, tz.id)}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(baseDate, tz.id)}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeTimezone(index)}>
                                <Trash2 className="h-4 w-4 text-red-500"/>
                            </Button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <Combobox
                            items={timezoneOptions}
                            value={''}
                            onValueChange={addTimezone}
                            placeholder="Add another time zone..."
                            searchPlaceholder="Search time zone..."
                            notFoundMessage="Time zone not found."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
