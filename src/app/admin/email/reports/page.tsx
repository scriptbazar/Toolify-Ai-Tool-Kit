
'use client';

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
  BarChart3,
  Mail,
  MousePointerClick,
  TrendingUp,
  UserX,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

const engagementData = [
  { date: '2024-07-22', opens: 1200, clicks: 300 },
  { date: '2024-07-23', opens: 1500, clicks: 450 },
  { date: '2024-07-24', opens: 1300, clicks: 350 },
  { date: '2024-07-25', opens: 1800, clicks: 600 },
  { date: '2024-07-26', opens: 1700, clicks: 550 },
  { date: '2024-07-27', opens: 2100, clicks: 700 },
  { date: '2024-07-28', opens: 2500, clicks: 800 },
];

const topEmails = [
    { subject: '🚀 New Feature Alert: AI Image Generator!', sent: 5000, openRate: 50, clickRate: 15 },
    { subject: 'Welcome to ToolifyAI!', sent: 1200, openRate: 85, clickRate: 25 },
    { subject: 'Your Weekly Productivity Digest', sent: 8000, openRate: 35, clickRate: 8 },
    { subject: 'Last Chance: 25% Off Pro Plan', sent: 3000, openRate: 60, clickRate: 20 },
    { subject: 'Did you forget something in your cart?', sent: 500, openRate: 70, clickRate: 30 },
];


export default function EmailReportsPage() {
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
            <div className="text-2xl font-bold">125,340</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48.6%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-xs text-muted-foreground">-0.1% from last month</p>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Email Engagement Over Time</CardTitle>
            <CardDescription>A chart showing opens and clicks over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="opens" stroke="hsl(var(--primary))" name="Opens" />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" name="Clicks" />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Top Performing Emails</CardTitle>
                <CardDescription>Your most engaging email campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-1/2">Subject</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Open Rate</TableHead>
                        <TableHead>Click Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topEmails.map((email, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{email.subject}</TableCell>
                            <TableCell>{email.sent.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{email.openRate}%</span>
                                    <Progress value={email.openRate} className="w-24 h-2" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{email.clickRate}%</span>
                                    <Progress value={email.clickRate} className="w-24 h-2" />
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
