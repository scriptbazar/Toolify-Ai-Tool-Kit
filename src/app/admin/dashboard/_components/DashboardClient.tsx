'use client';

import {
  ArrowUpRight,
  UserCheck,
  UserPlus,
  Users,
  UserRound,
  Copy,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  date: string;
  amount: string;
}

interface UserCounts {
    all: number;
    signup: number;
    lead: number;
    affiliate: number;
}

interface ChartData {
  month: string;
  users: number;
}

const chartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
};

interface DashboardClientProps {
    userCounts: UserCounts;
    recentUsers: User[];
    chartData: ChartData[];
}

export function AdminDashboardClient({ userCounts, recentUsers, chartData }: DashboardClientProps) {
    const { toast } = useToast();

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: `Copied ${fieldName}: ${text}` });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                An overview of your application's key metrics.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Link href="/admin/users?filter=all">
                <StatCard title="All Users" value={userCounts.all.toLocaleString()} icon={Users} />
                </Link>
                <Link href="/admin/users?filter=signup">
                <StatCard title="Signup Users" value={`+${userCounts.signup.toLocaleString()}`} icon={UserPlus} />
                </Link>
                <Link href="/admin/users?filter=lead">
                <StatCard title="Lead Users" value={`+${userCounts.lead.toLocaleString()}`} icon={UserCheck} />
                </Link>
                <Link href="/admin/affiliate-management">
                <StatCard title="Affiliate Users" value={`+${userCounts.affiliate.toLocaleString()}`} icon={UserRound} />
                </Link>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                    <CardTitle>Recent Signups</CardTitle>
                    <CardDescription>
                        Recent users that signed up for ToolifyAI.
                    </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/admin/users">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden xl:table-column">Plan</TableHead>
                        <TableHead className="hidden xl:table-column">
                            Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell lg:hidden xl:table-column">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentUsers.map(user => (
                        <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <div className="font-medium">{user.name}</div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    {user.email}
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(user.email, 'Email')}>
                                        <Copy className="h-3 w-3" />
                                        <span className="sr-only">Copy Email</span>
                                    </Button>
                                </div>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-column">{user.plan}</TableCell>
                        <TableCell className="hidden xl:table-column">
                            <Badge className="text-xs" variant="outline">
                            {user.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                            {user.date}
                        </TableCell>
                        <TableCell className="text-right">{user.amount}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Monthly User Signups</CardTitle>
                    <CardDescription>
                    A line chart showing the number of new users per month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        />
                        <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickCount={6}
                        allowDecimals={false}
                        />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Line
                        dataKey="users"
                        type="monotone"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={true}
                        />
                    </LineChart>
                    </ChartContainer>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}
