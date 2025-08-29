
'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/ai/flows/settings-management';
import { type SecuritySettings } from '@/ai/flows/settings-management.types';
import { Logo } from '@/components/common/Logo';
import { Construction } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CountdownTimer = ({ until }: { until: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(until) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
       if (Object.values(newTimeLeft).every(val => val === 0)) {
        // Force refresh when timer ends to re-check maintenance mode
         window.location.reload();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });
  
  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
      if (value === 0 && interval !== 'seconds' && timeLeft.days === 0 && (interval !== 'minutes' || timeLeft.hours === 0)) {
          return null;
      }
      return (
          <div key={interval} className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-bold text-primary tabular-nums">
                  {String(value).padStart(2, '0')}
              </span>
              <span className="text-sm uppercase text-muted-foreground">{interval}</span>
          </div>
      );
  }).filter(Boolean);


  if (!timerComponents.length) {
    return null;
  }


  return (
    <div className="flex space-x-4 md:space-x-8">
        {timerComponents}
    </div>
  );
};


export default function MaintenancePage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaintenanceSettings() {
      try {
        const appSettings = await getSettings();
        const securitySettings = appSettings.general?.security;
        if (securitySettings) {
           if (securitySettings.maintenanceModeUntil && typeof securitySettings.maintenanceModeUntil === 'string') {
              securitySettings.maintenanceModeUntil = new Date(securitySettings.maintenanceModeUntil);
           }
          setSettings(securitySettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMaintenanceSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <div className="mb-8">
            <Logo className="h-16 w-16 mx-auto text-primary animate-bounce"/>
        </div>
        <Construction className="h-20 w-20 text-primary mb-6 animate-pulse"/>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
            Under Maintenance
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-8">
            {settings?.maintenanceModeMessage || "We're currently performing scheduled maintenance to improve our services. We'll be back online shortly. Thank you for your patience!"}
        </p>

        {settings?.maintenanceModeUntil && <CountdownTimer until={settings.maintenanceModeUntil} />}
    </div>
  );
}
