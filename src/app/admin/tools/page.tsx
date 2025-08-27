'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { tools, toolCategories, type Tool } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Sparkles, CheckCircle, XCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend tool type for filtering demo
type ToolWithStatus = Tool & {
  plan: 'Free' | 'Pro';
  isNew: boolean;
  status: 'Active' | 'Disabled';
};

// Add dummy data for demonstration
const toolsWithStatus: ToolWithStatus[] = tools.map((tool, index) => ({
  ...tool,
  plan: index % 3 === 0 ? 'Pro' : 'Free',
  isNew: index === 1,
  status: 'Active',
}));

type FilterType = 'all' | 'pro' | 'free' | 'new' | 'active' | 'disabled';

export default function AdminToolsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCategoryName = (categoryId: string) => {
    return toolCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };
  
  const counts = useMemo(() => ({
    all: toolsWithStatus.length,
    pro: toolsWithStatus.filter(t => t.plan === 'Pro').length,
    free: toolsWithStatus.filter(t => t.plan === 'Free').length,
    new: toolsWithStatus.filter(t => t.isNew).length,
    active: toolsWithStatus.filter(t => t.status === 'Active').length,
    disabled: toolsWithStatus.filter(t => t.status === 'Disabled').length,
  }), []);


  const filteredTools = useMemo(() => {
    return toolsWithStatus
      .filter(tool => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pro') return tool.plan === 'Pro';
        if (activeFilter === 'free') return tool.plan === 'Free';
        if (activeFilter === 'new') return tool.isNew;
        if (activeFilter === 'active') return tool.status === 'Active';
        if (activeFilter === 'disabled') return tool.status === 'Disabled';
        return true;
      })
      .filter(tool => {
        if (selectedCategory === 'all') return true;
        return tool.category === selectedCategory;
      })
      .filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [activeFilter, selectedCategory, searchQuery]);
  
  const tabs: { id: FilterType; label: string; icon: React.ElementType, count: number }[] = [
    { id: 'all', label: 'All', icon: Package, count: counts.all },
    { id: 'pro', label: 'Pro', icon: Star, count: counts.pro },
    { id: 'free', label: 'Free', icon: Package, count: counts.free },
    { id: 'new', label: 'New', icon: Sparkles, count: counts.new },
    { id: 'active', label: 'Active', icon: CheckCircle, count: counts.active },
    { id: 'disabled', label: 'Disabled', icon: XCircle, count: counts.disabled },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Tool Management</CardTitle>
          <CardDescription>View, manage, and filter all available tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
             <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab) => (
                    <Button
                    key={tab.id}
                    variant={activeFilter === tab.id ? 'default' : 'outline'}
                    onClick={() => setActiveFilter(tab.id)}
                    className="shrink-0"
                    >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label} ({tab.count})
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {toolCategories.map(cat => (
                           <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-auto"
                    />
                </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map(tool => (
                <TableRow key={tool.slug}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <tool.Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{tool.name}</span>
                       {tool.isNew && <Badge variant="outline" className="text-primary border-primary">New</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(tool.category)}</TableCell>
                   <TableCell>
                    <Badge variant={tool.plan === 'Pro' ? 'secondary' : 'outline'}>{tool.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.status === 'Active' ? 'default' : 'destructive'} className={cn(tool.status === 'Active' && 'bg-green-500 hover:bg-green-600')}>{tool.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
               {filteredTools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No tools found.
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
