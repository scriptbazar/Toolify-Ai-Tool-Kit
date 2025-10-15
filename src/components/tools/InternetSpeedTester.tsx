
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
    <div className="flex flex-col items-center space-y-8">
        <div className="relative flex items-center justify-center">
             <Gauge className="w-48 h-48 text-primary/70" />
             <Button 
                onClick={handleStartTest} 
                disabled={testState === 'testing'}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-20%] rounded-full h-20 w-20 text-xl font-bold shadow-lg"
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
