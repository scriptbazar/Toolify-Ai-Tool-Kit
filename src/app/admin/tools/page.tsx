

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTools, upsertTool } from '@/ai/flows/tool-management';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
} from '@/components/ui/dialog';
import {
  ListChecks,
  Sparkles,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  PlusCircle,
  Loader2,
  Construction,
  GitCommitVertical,
  FlaskConical,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EditToolForm } from './[id]/page.client';


const ITEMS_PER_PAGE = 10;

export default function AdminToolsPage() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const searchQueryParam = searchParams.get('q') || '';
  const categoryQueryParam = (searchParams.get('category') as ToolCategory) || 'all';
  const filterQueryParam = searchParams.get('filter') || 'all';
  const pageQueryParam = Number(searchParams.get('page')) || 1;

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>(categoryQueryParam);
  const [activeFilter, setActiveFilter] = useState(filterQueryParam);
  const [currentPage, setCurrentPage] = useState(pageQueryParam);
  
   const fetchTools = async () => {
    setLoading(true);
    try {
      const tools = await getTools();
      const visibleTools = tools;
      setAllTools(visibleTools);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load tools from the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchTools();
  }, []);
  
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setActiveCategory(categoryQueryParam);
    setActiveFilter(filterQueryParam);
    setCurrentPage(pageQueryParam);
  }, [searchQueryParam, categoryQueryParam, filterQueryParam, pageQueryParam]);


  const counts = useMemo(() => ({
    all: allTools.length,
    pro: allTools.filter(t => t.plan === 'Pro').length,
    free: allTools.filter(t => t.plan === 'Free').length,
    new: allTools.filter(t => t.isNew).length,
    active: allTools.filter(t => t.status === 'Active').length,
    disabled: allTools.filter(t => t.status === 'Disabled').length,
    maintenance: allTools.filter(t => t.status === 'Maintenance').length,
    comingSoon: allTools.filter(t => t.status === 'Coming Soon').length,
    newVersion: allTools.filter(t => t.status === 'New Version').length,
    beta: allTools.filter(t => t.status === 'Beta').length,
  }), [allTools]);

  const filteredTools = useMemo(() => {
    return allTools
    .filter(tool => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'pro') return tool.plan === 'Pro';
      if (activeFilter === 'free') return tool.plan === 'Free';
      if (activeFilter === 'new') return tool.isNew;
      if (activeFilter === 'active') return tool.status === 'Active';
      if (activeFilter === 'disabled') return tool.status === 'Disabled';
      if (activeFilter === 'maintenance') return tool.status === 'Maintenance';
      if (activeFilter === 'comingSoon') return tool.status === 'Coming Soon';
      if (activeFilter === 'newVersion') return tool.status === 'New Version';
      if (activeFilter === 'beta') return tool.status === 'Beta';
      return true;
    })
    .filter(tool => {
      if (activeCategory === 'all') return true;
      return tool.category === activeCategory;
    })
    .filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTools, activeFilter, activeCategory, searchQuery]);
  

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const paginatedTools = useMemo(() => {
    return filteredTools.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredTools, currentPage]);

  const getCategoryName = (categoryId: string) => {
    return toolCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };
  
  const createQueryString = (params: Record<string, string | number | null>) => {
    const currentParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || (key === 'page' && value === 1)) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(value));
      }
    }
    return currentParams.toString();
  };
  
  
  const handleCategoryChange = (value: string) => {
    router.push(`/admin/tools?${createQueryString({ category: value === 'all' ? null : value, page: 1 })}`);
  };
  
  const handleFilterChange = (value: string) => {
    router.push(`/admin/tools?${createQueryString({ filter: value === 'all' ? null : value, page: 1 })}`);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    router.push(`/admin/tools?${createQueryString({ q: newSearchQuery, page: 1 })}`);
  };
  
  const handleEditClick = (tool: Tool) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };
  
  const handleFormSave = async (data: any) => {
    const toolData = {
        id: editingTool?.id,
        ...data,
    };
    const result = await upsertTool(toolData);
    if (result.success) {
        toast({
            title: `Tool updated successfully!`,
            description: `The tool "${data.name}" has been saved.`,
        });
        setIsDialogOpen(false);
        setEditingTool(null);
        fetchTools(); // Refresh the list
    } else {
         toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    return result.success;
  }

  const tabs: { id: string; label: string; icon: React.ElementType, count: number }[] = [
    { id: 'all', label: 'All', icon: Package, count: counts.all },
    { id: 'pro', label: 'Pro', icon: Star, count: counts.pro },
    { id: 'free', label: 'Free', icon: Package, count: counts.free },
    { id: 'new', label: 'New', icon: Sparkles, count: counts.new },
    { id: 'active', label: 'Active', icon: CheckCircle, count: counts.active },
    { id: 'beta', label: 'Beta', icon: FlaskConical, count: counts.beta },
    { id: 'newVersion', label: 'New Version', icon: GitCommitVertical, count: counts.newVersion },
    { id: 'comingSoon', label: 'Coming Soon', icon: Sparkles, count: counts.comingSoon },
    { id: 'maintenance', label: 'Maintenance', icon: Construction, count: counts.maintenance },
    { id: 'disabled', label: 'Disabled', icon: XCircle, count: counts.disabled },
  ];
  
  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
        case 'Active': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Active</Badge>;
        case 'Disabled': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Disabled</Badge>;
        case 'Maintenance': return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Construction className="mr-1 h-3 w-3"/>Maintenance</Badge>;
        case 'Coming Soon': return <Badge className="bg-blue-500 hover:bg-blue-600"><Sparkles className="mr-1 h-3 w-3"/>Coming Soon</Badge>;
        case 'New Version': return <Badge className="bg-green-500 hover:bg-green-600"><GitCommitVertical className="mr-1 h-3 w-3"/>New Version</Badge>;
        case 'Beta': return <Badge className="bg-orange-500 hover:bg-orange-600"><FlaskConical className="mr-1 h-3 w-3"/>Beta</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }

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
                <Button
                  key={tab.id}
                  variant={activeFilter === tab.id ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0 gap-1.5 px-3"
                  onClick={() => handleFilterChange(tab.id)}
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
                        name="q"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search tools..."
                        className="pl-9 w-full sm:max-w-xs h-10"
                    />
                </div>
                <Select value={activeCategory} onValueChange={handleCategoryChange}>
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
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                        {getStatusBadge(tool.status)}
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="outline" size="sm" onClick={() => handleEditClick(tool)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
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
            )}
          
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/tools?${createQueryString({ page: currentPage - 1 })}`)} disabled={currentPage <= 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/tools?${createQueryString({ page: currentPage + 1 })}`)} disabled={currentPage >= totalPages}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                  <DialogTitle>Edit Tool: {editingTool?.name}</DialogTitle>
                  <DialogDesc>Modify the details of an existing tool.</DialogDesc>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                  <EditToolForm tool={editingTool} onSave={handleFormSave}/>
              </div>
          </DialogContent>
       </Dialog>
    </div>
  );
}
