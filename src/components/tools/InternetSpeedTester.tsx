
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Gauge, ArrowDown, ArrowUp, Timer } from 'lucide-react';

export function InternetSpeedTester() {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'finished'>('idle');
  const [results, setResults] = useState({
    download: 0,
    upload: 0,
    ping: 0,
  });

  const handleStartTest = () => {
    setTestState('testing');
    // Simulate test
    setTimeout(() => {
        setResults({
            download: (Math.random() * 100) + 10,
            upload: (Math.random() * 50) + 5,
            ping: Math.floor(Math.random() * 50) + 10,
        });
        setTestState('finished');
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
        <div className="relative">
             <Gauge className="w-48 h-48 text-primary" />
             <Button 
                onClick={handleStartTest} 
                disabled={testState === 'testing'}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full h-24 w-24 text-xl font-bold"
             >
                {testState === 'idle' && 'GO'}
                {testState === 'testing' && '...'}
                {testState === 'finished' && 'GO'}
             </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="text-center">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2"><ArrowDown/>Download</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{results.download.toFixed(2)} <span className="text-base font-normal">Mbps</span></p></CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2"><ArrowUp/>Upload</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{results.upload.toFixed(2)} <span className="text-base font-normal">Mbps</span></p></CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Timer/>Ping</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{results.ping} <span className="text-base font-normal">ms</span></p></CardContent>
            </Card>
        </div>
    </div>
  );
}
