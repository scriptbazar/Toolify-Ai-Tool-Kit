
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '../ui/button';
import { Copy, Globe, RefreshCw, Network, Hash, Laptop, Fingerprint, MonitorSmartphone, Palette, Languages, Signal, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface DeviceInfo {
    ipv4: string;
    ipv6: string;
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

export function DeviceInformationDetector() {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDeviceInfo = async () => {
        setLoading(true);
        try {
            // Fetch IPv4 and IPv6 in parallel
            const [ipv4Res, ipv6Res] = await Promise.all([
                fetch('https://api.ipify.org?format=json').catch(() => null),
                fetch('https://api64.ipify.org?format=json').catch(() => null)
            ]);

            const ipv4 = ipv4Res && ipv4Res.ok ? (await ipv4Res.json()).ip : 'Not available';
            const ipv6 = ipv6Res && ipv6Res.ok ? (await ipv6Res.json()).ip : 'Not available';

            const ua = navigator.userAgent;
            let browserName = "Unknown";
            let browserVersion = "Unknown";
            let os = "Unknown";

            // OS Detection
            if (ua.includes("Win")) os = "Windows";
            else if (ua.includes("Mac")) os = "macOS";
            else if (ua.includes("Linux")) os = "Linux";
            else if (ua.includes("Android")) os = "Android";
            else if (ua.includes("like Mac")) os = "iOS";

            // Browser Detection
            let match;
            if ((match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i))) {
                if (/trident/i.test(match[1])) {
                    browserName = "Internet Explorer";
                    browserVersion = ua.match(/\brv[ :]+(\d+)/g)?.[0].substring(3) || "Unknown";
                } else if (match[1] === 'Chrome') {
                    const edgeMatch = ua.match(/\b(Edg|Edge)\/(\d+)/);
                    if (edgeMatch) {
                        browserName = "Edge";
                        browserVersion = edgeMatch[2];
                    } else {
                        browserName = match[1];
                        browserVersion = match[2];
                    }
                } else {
                    browserName = match[1];
                    browserVersion = match[2];
                }
            }

            setDeviceInfo({
                ipv4,
                ipv6,
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
        fetchDeviceInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: 'Copied to clipboard!' });
    };

    const getShareSummary = () => {
        if (!deviceInfo) return '';
        return `*My Device Information*\n\n` +
            `*OS:* ${deviceInfo.os}\n` +
            `*Browser:* ${deviceInfo.browserName} ${deviceInfo.browserVersion}\n` +
            `*Screen:* ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}\n` +
            `*IPv4:* ${deviceInfo.ipv4}\n\n` +
            `_Detected by ToolifyAI Device Info Detector_`;
    };

    const handleShare = (platform: 'whatsapp' | 'email' | 'telegram') => {
        const summary = getShareSummary();
        if (!summary) return;

        if (platform === 'whatsapp') {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
            window.open(whatsappUrl, '_blank');
        } else if (platform === 'email') {
            const subject = 'My Device Information';
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.replace(/\*/g, ''))}`;
            window.location.href = mailtoUrl;
        } else if (platform === 'telegram') {
            const telegramUrl = `https://t.me/share/url?url=https://toolifyai.com&text=${encodeURIComponent(summary)}`;
            window.open(telegramUrl, '_blank');
        }
    };

    const infoRows = [
        { label: 'IPv4 Address', value: deviceInfo?.ipv4, icon: Network },
        { label: 'IPv6 Address', value: deviceInfo?.ipv6, icon: Network },
        { label: 'Browser Name', value: deviceInfo?.browserName, icon: Globe },
        { label: 'Browser Version', value: deviceInfo?.browserVersion, icon: Hash },
        { label: 'Operating System', value: deviceInfo?.os, icon: Laptop },
        { label: 'User Agent', value: deviceInfo?.userAgent, icon: Fingerprint },
        { label: 'Screen Resolution', value: deviceInfo ? `${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}` : '', icon: MonitorSmartphone },
        { label: 'Color Depth', value: deviceInfo ? `${deviceInfo.colorDepth}-bit` : '', icon: Palette },
        { label: 'Language', value: deviceInfo?.language, icon: Languages },
        { label: 'Online Status', value: deviceInfo?.isOnline ? 'Online' : 'Offline', icon: Signal },
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
                        {[...Array(10)].map((_, i) => (
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
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-6 w-6" /> Your Device Details
                    </CardTitle>
                    <CardDescription>A complete report of your current browser and system configuration.</CardDescription>
                </div>
                 <Button onClick={fetchDeviceInfo} variant="outline" size="icon" disabled={loading}>
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Share2/>Share Report</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleShare('whatsapp')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.39 1.22 4.84l-1.18 4.34 4.45-1.16c1.4.74 3 .12 4.58.12h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM16.4 15.2c-.17-.08-1-.49-1.15-.55s-.27-.08-.39.08-.44.55-.54.66-.2.13-.37.04-1.15-.42-2.19-1.34c-.81-.72-1.36-1.61-1.52-1.88s.14-.42.21-.54.17-.27.26-.4.03-.22.06-.36-.02-.27-.06-.36-1-2.4-1.37-3.29c-.36-.85-.73-.73-.99-.74h-.27c-.22 0-.58.08-.89.36s-1.04 1.01-1.04 2.47c0 1.46 1.06 2.87 1.21 3.07s2.07 3.16 5.02 4.43c.7.3 1.25.48 1.68.61s.88.21 1.32.18c.55-.07 1.66-.68 1.9-1.33s.23-1.21.16-1.33c-.07-.12-.25-.2-.42-.28z"/>
                    </svg>
                    WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleShare('email')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                    Email
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleShare('telegram')}>
                     <svg viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.43 3.662c.272-1.21-.488-1.699-1.262-1.428L1.125 8.818c-1.21.49-1.201 1.161-.224 1.445l4.163 1.297 9.876-6.215c.482-.3.923-.142.533.193z"/>
                    </svg>
                    Telegram
                </Button>
            </CardContent>
        </Card>
    </div>
    );
}
