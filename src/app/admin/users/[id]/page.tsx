
'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  MoreVertical,
  Mail,
  Phone,
  Building,
  User,
  ShieldCheck,
  Calendar,
  Copy,
  LayoutGrid,
  CreditCard,
  Landmark,
  Wallet,
  DollarSign,
  TrendingUp,
  BarChart,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to All Users
      </Link>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 text-3xl">
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Ganesh Kumar</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span># UVPAYM19117844</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy('UVPAYM19117844')}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Suspend User</DropdownMenuItem>
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem>Upgrade Plan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">pappu@gmail.com</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy('pappu@gmail.com')}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">7675466543</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy('7675466543')}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Script Bazar</span>
          </div>
        </CardContent>
        <CardContent className="p-6 pt-0 flex flex-wrap items-center gap-4">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
          <Badge variant="outline"><User className="mr-2 h-3 w-3" />Plan: Free</Badge>
          <Badge variant="outline"><User className="mr-2 h-3 w-3" />Role: merchant</Badge>
          <Badge variant="destructive"><ShieldCheck className="mr-2 h-3 w-3" />KYC: Not Started</Badge>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined: 7/21/2025</span>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><LayoutGrid className="mr-2 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="transactions"><CreditCard className="mr-2 h-4 w-4" />Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals" disabled><Landmark className="mr-2 h-4 w-4" />Withdrawals</TabsTrigger>
          <TabsTrigger value="wallet" disabled><Wallet className="mr-2 h-4 w-4" />Wallet Management</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,523.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+235</div>
                  <p className="text-xs text-muted-foreground">+18.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Transaction</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2d ago</div>
                  <p className="text-xs text-muted-foreground">on 8/3/2025</p>
                </CardContent>
              </Card>
            </div>
             <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">More overview data will be available here.</p>
                    </CardContent>
                </Card>
             </div>
        </TabsContent>
         <TabsContent value="transactions" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                     <p className="text-muted-foreground">Transaction details will be displayed here.</p>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
