
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '../ui/button';
import { Copy, Globe, RefreshCw, Network, Hash, Laptop, Fingerprint, MonitorSmartphone, Palette, Languages, Signal } from 'lucide-react';
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
        if (ua.indexOf("Win") != -1) os = "Windows";
        if (ua.indexOf("Mac") != -1) os = "macOS";
        if (ua.indexOf("Linux") != -1) os = "Linux";
        if (ua.indexOf("Android") != -1) os = "Android";
        if (ua.indexOf("like Mac") != -1) os = "iOS";
        
        // Browser Detection
        let match;
        if ((match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)) || []) {
             if (/trident/i.test(match[1])) {
                const tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                browserName = "IE";
                browserVersion = tem[1] || "";
            } else if (match[1] === 'Chrome') {
                const tem = ua.match(/\b(OPR|Edg)\/(\d+)/);
                if (tem != null) {
                    const parts = tem.slice(1);
                    browserName = parts[0].replace('OPR', 'Opera').replace('Edg', 'Edge');
                    browserVersion = parts[1];
                } else {
                     browserName = match[1];
                     browserVersion = match[2];
                }
            } else {
                match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
                if ((browserVersion = ua.match(/version\/(\d+)/i)) != null) {
                    match.splice(1, 1, browserVersion[1]);
                }
                browserName = match[0];
                browserVersion = match[1];
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
        { label: 'Your IP Address', value: browserInfo?.ip, icon: Network },
        { label: 'Browser Name', value: browserInfo?.browserName, icon: Globe },
        { label: 'Browser Version', value: browserInfo?.browserVersion, icon: Hash },
        { label: 'Operating System', value: browserInfo?.os, icon: Laptop },
        { label: 'User Agent', value: browserInfo?.userAgent, icon: Fingerprint },
        { label: 'Screen Resolution', value: browserInfo ? `${browserInfo.screenWidth} x ${browserInfo.screenHeight}` : '', icon: MonitorSmartphone },
        { label: 'Color Depth', value: browserInfo ? `${browserInfo.colorDepth}-bit` : '', icon: Palette },
        { label: 'Language', value: browserInfo?.language, icon: Languages },
        { label: 'Online Status', value: browserInfo?.isOnline ? 'Online' : 'Offline', icon: Signal },
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
                        {[...Array(9)].map((_, i) => (
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
                                <TableCell className="font-semibold w-1/3">
                                    <div className="flex items-center gap-2">
                                        <row.icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{row.label}</span>
                                    </div>
                                </TableCell>
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
