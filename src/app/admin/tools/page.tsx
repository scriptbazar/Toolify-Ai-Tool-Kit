
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { toolCategories } from '@/lib/constants';
import { getTools, upsertTool } from '@/ai/flows/tool-management';
import { type Tool } from '@/ai/flows/tool-management.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Sparkles, CheckCircle, XCircle, Package, MoreHorizontal, Edit, PlusCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type FilterType = 'all' | 'pro' | 'free' | 'new' | 'active' | 'disabled';

const ITEMS_PER_PAGE = 10;

export default function AdminToolsPage() {
  const [toolsList, setToolsList] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const fetchTools = async () => {
    setLoading(true);
    try {
      const tools = await getTools();
      setToolsList(tools);
    } catch (error) {
      toast({
        title: 'Error fetching tools',
        description: 'Could not load tools from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [toast]);

  const getCategoryName = (categoryId: string) => {
    return toolCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };
  
  const counts = useMemo(() => ({
    all: toolsList.length,
    pro: toolsList.filter(t => t.plan === 'Pro').length,
    free: toolsList.filter(t => t.plan === 'Free').length,
    new: toolsList.filter(t => t.isNew).length,
    active: toolsList.filter(t => t.status === 'Active').length,
    disabled: toolsList.filter(t => t.status === 'Disabled').length,
  }), [toolsList]);

  const filteredTools = useMemo(() => {
    return toolsList
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
  }, [activeFilter, selectedCategory, searchQuery, toolsList]);
  
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTools, currentPage]);

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  
  const handleUpdateTool = async (toolId: string, updates: Partial<Tool>) => {
    const originalTools = [...toolsList];
    const updatedTools = toolsList.map(tool =>
        tool.id === toolId ? { ...tool, ...updates } : tool
    );
    setToolsList(updatedTools);
    
    try {
        const toolToUpdate = updatedTools.find(t => t.id === toolId);
        if (!toolToUpdate) throw new Error("Tool not found");

        const result = await upsertTool(toolToUpdate);
        if (result.success) {
            toast({
                title: "Tool Updated",
                description: `The tool "${toolToUpdate.name}" has been updated.`,
            });
        } else {
             throw new Error(result.message);
        }
    } catch (error: any) {
        setToolsList(originalTools);
        toast({
            title: "Update Failed",
            description: error.message || 'Could not update the tool.',
            variant: 'destructive',
        });
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const tabs: { id: FilterType; label: string; icon: React.ElementType, count: number }[] = [
    { id: 'all', label: 'All', icon: Package, count: counts.all },
    { id: 'pro', label: 'Pro', icon: Star, count: counts.pro },
    { id: 'free', label: 'Free', icon: Package, count: counts.free },
    { id: 'new', label: 'New', icon: Sparkles, count: counts.new },
    { id: 'active', label: 'Active', icon: CheckCircle, count: counts.active },
    { id: 'disabled', label: 'Disabled', icon: XCircle, count: counts.disabled },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Management</h1>
          <p className="text-muted-foreground">
            View, manage, and filter all available tools.
          </p>
        </div>
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
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  onClick={() => handleFilterChange(tab.id)}
                  size="sm"
                  className="shrink-0 gap-1.5 px-3"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 w-full sm:max-w-xs h-10"
                />
                </div>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-auto h-10">
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {toolCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

           {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
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
                    {paginatedTools.map(tool => (
                        <TableRow key={tool.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
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
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions for {tool.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/tools/${tool.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Plan</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleUpdateTool(tool.id, { plan: 'Free' })}>
                                            Free
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateTool(tool.id, { plan: 'Pro' })}>
                                            Pro
                                        </DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleUpdateTool(tool.id, { status: 'Active' })}>
                                            Active
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateTool(tool.id, { status: 'Disabled' })}>
                                            Disabled
                                        </DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={tool.isNew}
                                    onCheckedChange={(checked) => handleUpdateTool(tool.id, { isNew: !!checked })}
                                >
                                    Mark as New
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    {paginatedTools.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No tools found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            )}

           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
