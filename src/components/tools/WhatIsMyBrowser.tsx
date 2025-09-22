
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
    browserName: string;
    browserVersion: string;
    os: string;
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

    const getBrowserInfo = () => {
        const ua = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "Unknown";
        let os = "Unknown";

        // OS Detection
        if (/Windows/i.test(ua)) os = "Windows";
        else if (/Mac/i.test(ua)) os = "macOS";
        else if (/Linux/i.test(ua)) os = "Linux";
        else if (/Android/i.test(ua)) os = "Android";
        else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
        
        // Browser Detection
        let match;
        if ((match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)) || []) {
            if (/trident/i.test(match[1])) {
                const tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                browserName = "IE";
                browserVersion = tem[1] || "";
            } else if (match[1] === 'Chrome') {
                const tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) {
                    const parts = tem.slice(1);
                    browserName = parts[0].replace('OPR', 'Opera');
                    browserVersion = parts[1];
                } else {
                     browserName = match[1];
                     browserVersion = match[2];
                }
            } else {
                browserName = match[1];
                browserVersion = match[2];
            }
        }
        
        return { browserName, browserVersion, os };
    };

    const fetchBrowserInfo = async () => {
        setLoading(true);
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (!ipResponse.ok) throw new Error('Could not fetch IP address.');
            const ipData = await ipResponse.json();
            
            const { browserName, browserVersion, os } = getBrowserInfo();

            setBrowserInfo({
                ip: ipData.ip,
                userAgent: navigator.userAgent,
                browserName,
                browserVersion,
                os,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: 'Copied to clipboard!' });
    };

    const infoRows = [
        { label: 'Your IP Address', value: browserInfo?.ip },
        { label: 'Browser Name', value: browserInfo?.browserName },
        { label: 'Browser Version', value: browserInfo?.browserVersion },
        { label: 'Operating System', value: browserInfo?.os },
        { label: 'User Agent', value: browserInfo?.userAgent },
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
                 <Button onClick={fetchBrowserInfo} variant="outline" size="icon" disabled={loading}>
                    <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
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
                                        <span>{String(row.value)}</span>
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
