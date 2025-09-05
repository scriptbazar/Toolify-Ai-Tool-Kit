
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
  List,
  ListChecks,
  ListX,
  Sparkle,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allTools = await getTools();

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const activeCategory = typeof searchParams.category === 'string' ? (searchParams.category as ToolCategory) : 'all';
  const activeFilter = typeof searchParams.filter === 'string' ? searchParams.filter : 'all';
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

  const counts = {
    all: allTools.length,
    pro: allTools.filter(t => t.plan === 'Pro').length,
    free: allTools.filter(t => t.plan === 'Free').length,
    new: allTools.filter(t => t.isNew).length,
    active: allTools.filter(t => t.status === 'Active').length,
    disabled: allTools.filter(t => t.status === 'Disabled').length,
  };

  const filteredTools = allTools
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
      if (activeCategory === 'all') return true;
      return tool.category === activeCategory;
    })
    .filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const paginatedTools = filteredTools.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const getCategoryName = (categoryId: string) => {
    return toolCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const tabs: { id: string; label: string; icon: React.ElementType, count: number }[] = [
    { id: 'all', label: 'All', icon: Package, count: counts.all },
    { id: 'pro', label: 'Pro', icon: Star, count: counts.pro },
    { id: 'free', label: 'Free', icon: Package, count: counts.free },
    { id: 'new', label: 'New', icon: Sparkles, count: counts.new },
    { id: 'active', label: 'Active', icon: CheckCircle, count: counts.active },
    { id: 'disabled', label: 'Disabled', icon: XCircle, count: counts.disabled },
  ];

  const createQueryString = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if(typeof value === 'string') newSearchParams.set(key, value);
    }
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }
    return newSearchParams.toString();
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Management</h1>
          <p className="text-muted-foreground">
            View, manage, and filter all available tools.
          </p>
        </div>
         <Button asChild>
            <Link href="/admin/tools/new"><PlusCircle className="mr-2 h-4 w-4"/>Add New Tool</Link>
         </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Tools</CardTitle>
          <CardDescription>A comprehensive list of all tools available in the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
             <div className="flex flex-wrap items-center gap-2 flex-grow">
               {tabs.map((tab) => (
                <Link key={tab.id} href={`?${createQueryString({ filter: tab.id, page: '1' })}`} scroll={false}>
                    <Button
                      variant={activeFilter === tab.id ? 'default' : 'outline'}
                      size="sm"
                      className="shrink-0 gap-1.5 px-3"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label} ({tab.count})
                    </Button>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <form className="relative w-full sm:w-auto" action="/admin/tools" method="GET">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="q"
                        defaultValue={searchQuery}
                        placeholder="Search tools..."
                        className="pl-9 w-full sm:max-w-xs h-10"
                    />
                     <input type="hidden" name="filter" value={activeFilter} />
                     <input type="hidden" name="category" value={activeCategory} />
                </form>
                <Select value={activeCategory} onValueChange={(value) => router.push(`?${createQueryString({ category: value, page: '1' })}`)}>
                    <SelectTrigger className="w-full sm:w-[180px] h-10">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="all">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                All Categories
                            </div>
                        </SelectItem>
                        {toolCategories.map(cat => (
                           <SelectItem key={cat.id} value={cat.id}>
                             <div className="flex items-center gap-2">
                               <cat.Icon className="h-4 w-4" />
                               {cat.name}
                             </div>
                           </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTools.map(tool => {
                  const IconComponent = (Icons as any)[tool.icon] || Icons.HelpCircle;
                  return (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
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
                      <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/tools/${tool.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedTools.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No tools found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Link href={`?${createQueryString({ page: page - 1 })}`} scroll={false}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Link href={`?${createQueryString({ page: page + 1 })}`} scroll={false}>
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
