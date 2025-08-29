
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  MousePointerClick,
  TrendingUp,
  UserX,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { getEmailLog, type EmailLog } from '@/ai/flows/send-email';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });


interface ReportStats {
    totalSent: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
}

interface EngagementData {
    date: string;
    sent: number;
}

interface TopEmail {
    subject: string;
    sent: number;
}


export default function EmailReportsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<ReportStats>({ totalSent: 0, openRate: 0, clickRate: 0, unsubscribeRate: 0 });
    const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
    const [topEmails, setTopEmails] = useState<TopEmail[]>([]);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        async function fetchReportData() {
            setLoading(true);
            try {
                const emails = await getEmailLog();
                
                // Calculate Stats
                const totalSent = emails.length;
                // Note: Open/Click/Unsubscribe rates require webhooks and are placeholders for now.
                setStats({ totalSent, openRate: 48.6, clickRate: 15.2, unsubscribeRate: 1.2 });

                // Process Engagement Data for the selected time range
                const days = parseInt(timeRange);
                const dateCounts: { [key: string]: number } = {};
                
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    dateCounts[key] = 0;
                }

                emails.forEach(email => {
                    const emailDate = new Date(email.date).toISOString().split('T')[0];
                    if (emailDate in dateCounts) {
                        dateCounts[emailDate]++;
                    }
                });

                const chartData = Object.entries(dateCounts).map(([date, sent]) => ({ date, sent }));
                setEngagementData(chartData);

                // Process Top Emails (by subject count)
                const subjectCounts: { [key: string]: number } = {};
                emails.forEach(email => {
                    subjectCounts[email.subject] = (subjectCounts[email.subject] || 0) + 1;
                });
                
                const sortedTopEmails = Object.entries(subjectCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([subject, sent]) => ({ subject, sent }));

                setTopEmails(sortedTopEmails);

            } catch (err: any) {
                console.error("Failed to load email reports:", err);
                setError("Could not load report data. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchReportData();
    }, [timeRange]);

  if (loading) {
    return (
        <div className="space-y-6">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-8 w-2/3" />
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
             </div>
             <Skeleton className="h-96" />
             <Skeleton className="h-64" />
        </div>
    )
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }


  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Reports</h1>
        <p className="text-muted-foreground">
          Analyze the performance of your email campaigns.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total emails dispatched from the system.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Requires webhook integration.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Requires webhook integration.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Requires webhook integration.</p>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Email Engagement Over Time</CardTitle>
              <CardDescription>A chart showing emails sent over the selected period.</CardDescription>
            </div>
             <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" name="Sent Emails" />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Top Sent Emails</CardTitle>
                <CardDescription>Your most frequently sent email campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-2/3">Subject</TableHead>
                        <TableHead className="text-right">Times Sent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topEmails.map((email, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{email.subject}</TableCell>
                            <TableCell className="text-right">{email.sent.toLocaleString()}</TableCell>
                        </TableRow>
                        ))}
                         {topEmails.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    No email data to display.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
