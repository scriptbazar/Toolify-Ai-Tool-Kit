
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gauge, ArrowDown, ArrowUp, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InternetSpeedTester() {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'finished'>('idle');
  const [results, setResults] = useState({
    download: 0,
    upload: 0,
    ping: 0,
  });
  const [needleRotation, setNeedleRotation] = useState(0);

  const handleStartTest = () => {
    setTestState('testing');
    setResults({ download: 0, upload: 0, ping: 0 });
    
    // Simulate test
    setTimeout(() => {
        const downloadSpeed = (Math.random() * 100) + 10;
        const uploadSpeed = (Math.random() * 50) + 5;
        const pingTime = Math.floor(Math.random() * 50) + 10;
        
        setResults({
            download: downloadSpeed,
            upload: uploadSpeed,
            ping: pingTime,
        });
        
        // Map download speed (0-150Mbps) to rotation (0-180deg)
        const rotation = Math.min((downloadSpeed / 150) * 180, 180);
        setNeedleRotation(rotation);

        setTestState('finished');
    }, 4000); // Increased duration for animation
  };

  return (
    <div className="flex flex-col items-center space-y-8">
        <div className="relative flex items-center justify-center h-64 w-64">
             <div className="absolute w-full h-full">
                <div className={cn(
                    "w-full h-full rounded-full border-[16px] border-muted",
                    "border-b-primary/70 border-l-primary/70 border-r-primary/70",
                    "transform -rotate-45"
                )} style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)'
                }}></div>
                 {testState === 'testing' && (
                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping"></div>
                 )}
             </div>
             
             {/* Needle */}
             <div className={cn(
                "absolute bottom-1/2 left-1/2 w-1 h-1/2 bg-primary rounded-t-full transition-transform duration-1000 ease-out origin-bottom",
                testState === 'testing' && 'animate-speed-test'
             )} style={{
                 transform: `rotate(${testState === 'testing' ? 0 : needleRotation}deg)`
             }}></div>
             
             <div className="absolute bottom-1/2 left-1/2 w-4 h-4 bg-card border-2 border-primary rounded-full transform translate-x-[-50%] translate-y-[50%]"></div>
             
             <Button 
                onClick={handleStartTest} 
                disabled={testState === 'testing'}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 rounded-full h-24 w-24 text-xl font-bold shadow-lg"
             >
                {testState === 'idle' && 'GO'}
                {testState === 'testing' && '...'}
                {testState === 'finished' && 'GO'}
             </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="text-center">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <ArrowDown/>Download
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.download.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Mbps</p>
                </CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <ArrowUp/>Upload
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.upload.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Mbps</p>
                </CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Timer/>Ping
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.ping}</p>
                    <p className="text-sm text-muted-foreground">ms</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
