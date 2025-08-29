
'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Users,
  UserPlus,
  UserCheck,
  UserRound,
  Copy,
} from 'lucide-react';
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';


interface User {
  id: string;
  name: string;
  email: string;
  plan: string; // e.g., 'Free', 'Pro'
  status: string; // e.g., 'Approved', 'Active'
  date: string;
  amount: string;
}

interface UserCounts {
    all: number;
    signup: number;
    lead: number;
    referral: number; // Placeholder for now
}

const chartData = [
  { month: 'January', users: 186 },
  { month: 'February', users: 305 },
  { month: 'March', users: 237 },
  { month: 'April', users: 273 },
  { month: 'May', users: 209 },
  { month: 'June', users: 214 },
];

const chartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-1))',
  },
};

export default function AdminDashboard() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [userCounts, setUserCounts] = useState<UserCounts>({ all: 0, signup: 0, lead: 0, referral: 573 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch recent users for the table
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            plan: data.plan || 'Free', // Placeholder
            status: 'Approved', // Placeholder
            date: data.createdAt.toDate().toLocaleDateString(),
            amount: '$0.00', // Placeholder
          };
        });
        setRecentUsers(usersList);

        // Fetch counts for the stat cards
        const leadsSnapshot = await getDocs(collection(db, 'leads'));
        const signupCount = querySnapshot.size; // From the 'users' collection
        const leadCount = leadsSnapshot.size;
        
        setUserCounts(prev => ({
            ...prev,
            signup: signupCount,
            lead: leadCount,
            all: signupCount + leadCount
        }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
            title: "Error",
            description: "Could not load dashboard data.",
            variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [toast]);
  
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : userCounts.all.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users?filter=signup">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signup Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `+${userCounts.signup.toLocaleString()}`}</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users?filter=lead">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `+${userCounts.lead.toLocaleString()}`}</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/referral-management">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referral Users</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `+${userCounts.referral.toLocaleString()}`}</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
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
                {loading && [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                        <TableCell className="hidden xl:table-column"><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                        <TableCell className="hidden xl:table-column"><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-column"><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                        <TableCell className="text-right"><div className="h-4 bg-muted rounded w-1/4 ml-auto"></div></TableCell>
                    </TableRow>
                ))}
                {!loading && recentUsers.map(user => (
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
             <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart
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
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
