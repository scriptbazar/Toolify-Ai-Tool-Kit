
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '../ui/button';
import { Copy, Globe, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface BrowserInfo {
    ip: string;
    userAgent: string;
    appName: string;
    appVersion: string;
    platform: string;
    language: string;
    isOnline: boolean;
    screenWidth: number;
    screenHeight: number;
    colorDepth: number;
}

export function WhatIsMyBrowser() {
    const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchBrowserInfo = async () => {
        setLoading(true);
        try {
            // Fetch IP address from a public API
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (!ipResponse.ok) throw new Error('Could not fetch IP address.');
            const ipData = await ipResponse.json();

            setBrowserInfo({
                ip: ipData.ip,
                userAgent: navigator.userAgent,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                platform: navigator.platform,
                language: navigator.language,
                isOnline: navigator.onLine,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                colorDepth: window.screen.colorDepth,
            });
        } catch (error: any) {
            toast({
                title: 'Error Fetching Data',
                description: error.message || 'Could not retrieve all browser information.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrowserInfo();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: 'Copied to clipboard!' });
    };

    const infoRows = [
        { label: 'Your IP Address', value: browserInfo?.ip },
        { label: 'User Agent', value: browserInfo?.userAgent },
        { label: 'Browser Name', value: browserInfo?.appName },
        { label: 'Browser Version', value: browserInfo?.appVersion },
        { label: 'Operating System', value: browserInfo?.platform },
        { label: 'Screen Resolution', value: browserInfo ? `${browserInfo.screenWidth} x ${browserInfo.screenHeight}` : '' },
        { label: 'Color Depth', value: browserInfo ? `${browserInfo.colorDepth}-bit` : '' },
        { label: 'Language', value: browserInfo?.language },
        { label: 'Online Status', value: browserInfo?.isOnline ? 'Online' : 'Offline' },
    ];
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex justify-between">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-6 w-1/2" />
                             </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-6 w-6" /> Your Browser Details
                    </CardTitle>
                    <CardDescription>A complete report of your current browser and system configuration.</CardDescription>
                </div>
                 <Button onClick={fetchBrowserInfo} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Refresh</span>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {infoRows.map(row => row.value ? (
                            <TableRow key={row.label}>
                                <TableCell className="font-semibold w-1/3">{row.label}</TableCell>
                                <TableCell className="font-mono text-sm break-all">
                                    <div className="flex items-center justify-between gap-2">
                                        <span>{row.value}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(String(row.value))}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : null)}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
