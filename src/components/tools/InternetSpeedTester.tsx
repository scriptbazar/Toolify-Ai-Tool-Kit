
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gauge, ArrowDown, ArrowUp, Timer, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

export function InternetSpeedTester() {
  const [testState, setTestState] = useState<'idle' | 'ping' | 'download' | 'upload' | 'finished'>('idle');
  const [results, setResults] = useState({ download: 0, upload: 0, ping: 0 });
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [needleRotation, setNeedleRotation] = useState(-90);
  const [progress, setProgress] = useState(0);

  const mapSpeedToRotation = (speed: number) => {
    // Map speed (0-150Mbps) to rotation (-90 to 90deg)
    const clampedSpeed = Math.min(speed, 150);
    return (clampedSpeed / 150) * 180 - 90;
  };

  const resetTest = () => {
    setTestState('idle');
    setResults({ download: 0, upload: 0, ping: 0 });
    setLiveSpeed(0);
    setNeedleRotation(-90);
    setProgress(0);
  };
  
  const handleStartTest = () => {
    if (testState !== 'idle' && testState !== 'finished') return;
    
    resetTest();
    setTestState('ping');

    // 1. PING TEST
    const pingInterval = setInterval(() => {
        setLiveSpeed(prev => Math.random() * 5 + prev);
        setNeedleRotation(mapSpeedToRotation(Math.random() * 5));
    }, 100);
    setTimeout(() => {
      clearInterval(pingInterval);
      const pingTime = Math.floor(Math.random() * 40) + 8;
      setResults(prev => ({ ...prev, ping: pingTime }));
      setTestState('download');
      setProgress(0);
    }, 2000);

    // 2. DOWNLOAD TEST
    setTimeout(() => {
      let downloadProgress = 0;
      const downloadSpeed = (Math.random() * 100) + 20;
      const downloadInterval = setInterval(() => {
        downloadProgress += 5;
        setProgress(downloadProgress);
        const currentSpeed = (downloadProgress / 100) * downloadSpeed * (Math.random() * 0.4 + 0.8);
        setLiveSpeed(currentSpeed);
        setNeedleRotation(mapSpeedToRotation(currentSpeed));
        if (downloadProgress >= 100) {
          clearInterval(downloadInterval);
          setResults(prev => ({...prev, download: downloadSpeed}));
          setTestState('upload');
          setProgress(0);
        }
      }, 200);
    }, 2100);

    // 3. UPLOAD TEST
     setTimeout(() => {
      let uploadProgress = 0;
      const uploadSpeed = (Math.random() * 50) + 10;
      const uploadInterval = setInterval(() => {
        uploadProgress += 5;
        setProgress(uploadProgress);
        const currentSpeed = (uploadProgress / 100) * uploadSpeed * (Math.random() * 0.4 + 0.8);
        setLiveSpeed(currentSpeed);
        setNeedleRotation(mapSpeedToRotation(currentSpeed));
        if (uploadProgress >= 100) {
          clearInterval(uploadInterval);
          setResults(prev => ({...prev, upload: uploadSpeed}));
          setTestState('finished');
          setLiveSpeed(0);
        }
      }, 200);
    }, 6200);
  };

  const getStatusText = () => {
      switch (testState) {
          case 'ping': return 'Testing Ping...';
          case 'download': return 'Testing Download Speed...';
          case 'upload': return 'Testing Upload Speed...';
          case 'finished': return 'Test Complete';
          default: return 'Ready to test';
      }
  }

  return (
    <div className="flex flex-col items-center space-y-8">
        <div className="relative w-64 h-32 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-full">
                <div 
                    className="w-full h-[200%] rounded-full border-[20px] border-muted"
                    style={{
                        borderBottomColor: 'hsl(var(--primary))',
                        borderLeftColor: 'hsl(var(--primary))',
                        transform: 'rotate(-45deg)',
                    }}
                 />
            </div>
            <div 
                className="absolute bottom-0 left-1/2 w-1 h-1/2 bg-foreground rounded-t-full transition-transform duration-300 ease-linear origin-bottom" 
                style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)`}}
            />
            <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-5 h-5 bg-card border-2 border-foreground rounded-full"/>
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                 <p className="text-4xl font-bold">{liveSpeed.toFixed(1)}</p>
                 <p className="text-sm text-muted-foreground">Mbps</p>
             </div>
        </div>

        <div className="w-full max-w-md space-y-4">
             <Progress value={testState === 'download' || testState === 'upload' ? progress : (testState === 'finished' ? 100 : 0)} />
             <p className="text-center font-semibold">{getStatusText()}</p>
        </div>


        <Button 
            onClick={testState === 'idle' || testState === 'finished' ? handleStartTest : resetTest} 
            className="rounded-full h-24 w-24 text-xl font-bold shadow-lg"
        >
            {testState === 'idle' || testState === 'finished' ? <Play className="h-8 w-8"/> : <RotateCcw className="h-8 w-8"/>}
        </Button>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="text-center">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Timer/>Ping
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.ping.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">ms</p>
                </CardContent>
            </Card>
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
        </div>
    </div>
  );
}
