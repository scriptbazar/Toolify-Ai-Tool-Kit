
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { tools } from '@/lib/constants';
import { TrendingUp, Activity, Users, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const dummyToolStats = tools.slice(0, 10).map((tool, index) => ({
  ...tool,
  usageCount: Math.floor(Math.random() * 5000) + 1000,
  userCount: Math.floor(Math.random() * 800) + 200,
  averageRating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
}));

dummyToolStats.sort((a, b) => b.usageCount - a.usageCount);
const maxUsage = dummyToolStats[0].usageCount;

export default function TopToolsPage() {
  const [toolStats] = useState(dummyToolStats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Tools</h1>
        <p className="text-muted-foreground">
          Analytics on your most popular and frequently used tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Used Tools
          </CardTitle>
          <CardDescription>
            This list is ranked by the total number of times each tool has been used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Tool Name</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Unique Users</TableHead>
                  <TableHead>Avg. Rating</TableHead>
                  <TableHead>Usage Popularity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {toolStats.map((stat) => (
                  <TableRow key={stat.slug}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <stat.Icon className="h-5 w-5 text-muted-foreground" />
                        <span>{stat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        {stat.usageCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {stat.userCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {stat.averageRating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Progress value={(stat.usageCount / maxUsage) * 100} className="w-40" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
