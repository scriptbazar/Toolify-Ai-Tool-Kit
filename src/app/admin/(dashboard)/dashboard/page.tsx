
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
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';


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

export default function AdminDashboard() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [userCounts, setUserCounts] = useState<UserCounts>({ all: 0, signup: 0, lead: 0, affiliate: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch all users for counts and chart data
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const allUsersList = usersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        // --- Process Chart Data ---
        const monthlySignups: { [key: string]: number } = {};
        allUsersList.forEach(user => {
          if (user.createdAt && user.createdAt.seconds) {
            const date = new Date(user.createdAt.seconds * 1000);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
          }
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        const currentYear = today.getFullYear();
        const fullYearData: ChartData[] = [];

        for (let i = 0; i < 12; i++) {
          const monthKey = `${currentYear}-${i}`;
          fullYearData.push({
            month: monthNames[i],
            users: monthlySignups[monthKey] || 0,
          });
        }
        setChartData(fullYearData);


        // --- Process Recent Users Table (first 5) ---
        const recentUsersList = usersSnapshot.docs.slice(0, 5).map(doc => {
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
        setRecentUsers(recentUsersList);

        // --- Process Stat Cards ---
        const leadsSnapshot = await getDocs(collection(db, 'leads'));
        const affiliateQuery = query(collection(db, 'users'), where('affiliateStatus', '==', 'approved'));
        const affiliateSnapshot = await getDocs(affiliateQuery);

        const signupCount = usersSnapshot.size;
        const leadCount = leadsSnapshot.size;
        const affiliateCount = affiliateSnapshot.size;
        
        setUserCounts(prev => ({
            ...prev,
            signup: signupCount,
            lead: leadCount,
            all: signupCount + leadCount,
            affiliate: affiliateCount,
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
          <Card className="hover:bg-muted/50 transition-colors">
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
          <Card className="hover:bg-muted/50 transition-colors">
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
          <Card className="hover:bg-muted/50 transition-colors">
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
        <Link href="/admin/affiliate-management">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliate Users</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `+${userCounts.affiliate.toLocaleString()}`}</div>
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
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsLineChart
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
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
