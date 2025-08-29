
'use client';

import {
  ArrowUpRight,
  BarChart3,
  DollarSign,
  UserPlus,
  Users,
  Construction,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ComingSoonDialogContent = () => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Feature Coming Soon</DialogTitle>
      <DialogDescription>
        This analytics section is under construction. Check back later for more
        insights!
      </DialogDescription>
    </DialogHeader>
    <div className="min-h-[200px] flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
      <p className="text-lg text-muted-foreground">Coming soon!</p>
    </div>
  </DialogContent>
);

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = ['overview', 'audience', 'behavior', 'conversions'];

  return (
    <div className="flex-1 space-y-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          A detailed overview of your application's performance.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +18.3% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Users
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2,350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bounce Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23.5%</div>
                  <p className="text-xs text-muted-foreground">
                    -2.5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Under Development</CardTitle>
                    <CardDescription>
                    Live analytics data and charts are coming soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                        <Construction className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">We're working on bringing you live analytics!</p>
                        <p className="text-muted-foreground">Check back soon for detailed insights.</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}

        <Dialog
          open={activeTab !== 'overview'}
          onOpenChange={(isOpen) => !isOpen && setActiveTab('overview')}
        >
          <ComingSoonDialogContent />
        </Dialog>
      </div>
    </div>
  );
}
