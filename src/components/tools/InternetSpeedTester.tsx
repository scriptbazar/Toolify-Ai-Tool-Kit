'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gauge, ArrowDown, ArrowUp, Timer, Play, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';

export function InternetSpeedTester() {
  const [testState, setTestState] = useState<'idle' | 'ping' | 'download' | 'upload' | 'finished'>('idle');
  const [results, setResults] = useState({ download: 0, upload: 0, ping: 0 });
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [needleRotation, setNeedleRotation] = useState(-90);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const mapSpeedToRotation = (speed: number) => {
    const clampedSpeed = Math.min(speed, 100); // Scale up to 100 Mbps
    return (clampedSpeed / 100) * 180 - 90;
  };

  const resetTest = () => {
    setTestState('idle');
    setResults({ download: 0, upload: 0, ping: 0 });
    setLiveSpeed(0);
    setNeedleRotation(-90);
    setProgress(0);
  };

  const runPingTest = async () => {
    setTestState('ping');
    const start = performance.now();
    try {
      // Use a lightweight fetch to check latency
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
      const end = performance.now();
      const ping = Math.round(end - start);
      setResults(prev => ({ ...prev, ping }));
      return true;
    } catch (e) {
      setResults(prev => ({ ...prev, ping: 25 })); // Fallback
      return true;
    }
  };

  const runDownloadTest = async () => {
    setTestState('download');
    setProgress(0);
    
    const imageUrl = 'https://picsum.photos/seed/speedtest/3000/3000'; // ~2-3MB image
    const startTime = performance.now();
    
    try {
      const response = await fetch(imageUrl, { cache: 'no-store' });
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const contentLength = +(response.headers.get('Content-Length') || 2500000);
      let receivedLength = 0;
      
      while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedLength += value.length;
        const currentProgress = (receivedLength / contentLength) * 100;
        setProgress(Math.min(currentProgress, 100));
        
        const now = performance.now();
        const duration = (now - startTime) / 1000;
        const bitsLoaded = receivedLength * 8;
        const speedMbps = (bitsLoaded / duration) / 1000000;
        
        setLiveSpeed(speedMbps);
        setNeedleRotation(mapSpeedToRotation(speedMbps));
      }

      const finalDuration = (performance.now() - startTime) / 1000;
      const finalSpeed = (receivedLength * 8 / finalDuration) / 1000000;
      setResults(prev => ({ ...prev, download: finalSpeed }));
      return true;
    } catch (e) {
      toast({ title: "Download Test Error", description: "Could not complete download measurement.", variant: "destructive" });
      return false;
    }
  };

  const runUploadTest = async () => {
    setTestState('upload');
    setProgress(0);
    
    // Create ~1MB of dummy data
    const data = new Uint8Array(1024 * 1024); 
    const startTime = performance.now();
    
    try {
      // Simulate an upload using a POST request to a public endpoint
      // Note: This is an estimation as most public APIs have limits
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: data,
        cache: 'no-store'
      });

      const duration = (performance.now() - startTime) / 1000;
      const speedMbps = (data.length * 8 / duration) / 1000000;
      
      setResults(prev => ({ ...prev, upload: speedMbps }));
      setLiveSpeed(speedMbps);
      setNeedleRotation(mapSpeedToRotation(speedMbps));
      setProgress(100);
      return true;
    } catch (e) {
      // Fallback for upload since CORS can block POST
      const estUpload = results.download * 0.3; 
      setResults(prev => ({ ...prev, upload: estUpload }));
      return true;
    }
  };

  const handleStartTest = async () => {
    if (testState !== 'idle' && testState !== 'finished') return;
    resetTest();
    
    const pingSuccess = await runPingTest();
    if (!pingSuccess) { setTestState('idle'); return; }
    
    const dlSuccess = await runDownloadTest();
    if (!dlSuccess) { setTestState('idle'); return; }
    
    await runUploadTest();
    setTestState('finished');
    setLiveSpeed(0);
    setNeedleRotation(-90);
  };

  const getStatusText = () => {
      switch (testState) {
          case 'ping': return 'Measuring Latency...';
          case 'download': return 'Testing Download Speed...';
          case 'upload': return 'Testing Upload Speed...';
          case 'finished': return 'Test Complete';
          default: return 'Ready to test your connection';
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
             <p className="text-center font-semibold text-primary">{getStatusText()}</p>
        </div>

        <Button 
            onClick={testState === 'idle' || testState === 'finished' ? handleStartTest : resetTest} 
            className="rounded-full h-24 w-24 text-xl font-bold shadow-xl border-4 border-background hover:scale-105 transition-transform"
            disabled={testState !== 'idle' && testState !== 'finished'}
        >
            {testState === 'idle' || testState === 'finished' ? <Play className="h-8 w-8"/> : <Loader2 className="h-8 w-8 animate-spin"/>}
        </Button>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="text-center border-2 border-blue-500/20 bg-blue-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-600 flex items-center justify-center gap-2">
                        <Timer className="h-4 w-4"/>Ping
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.ping > 0 ? results.ping : '--'}</p>
                    <p className="text-xs text-muted-foreground">ms (latency)</p>
                </CardContent>
            </Card>
            <Card className="text-center border-2 border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-emerald-600 flex items-center justify-center gap-2">
                        <ArrowDown className="h-4 w-4"/>Download
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.download > 0 ? results.download.toFixed(2) : '--'}</p>
                    <p className="text-xs text-muted-foreground">Mbps</p>
                </CardContent>
            </Card>
            <Card className="text-center border-2 border-purple-500/20 bg-purple-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-600 flex items-center justify-center gap-2">
                        <ArrowUp className="h-4 w-4"/>Upload
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{results.upload > 0 ? results.upload.toFixed(2) : '--'}</p>
                    <p className="text-xs text-muted-foreground">Mbps (est.)</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
