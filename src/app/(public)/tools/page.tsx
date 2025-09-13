

'use client';

import { useState, useEffect, useMemo } from 'react';
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function ToolsDashboardPage() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQueryParam = searchParams.get('q') || '';
  const categoryQueryParam = (searchParams.get('category') as ToolCategory) || 'all';

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>(categoryQueryParam);
  
  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      try {
        const tools = await getTools();
        const visibleTools = tools.filter(tool => tool.status !== 'Disabled');
        setAllTools(visibleTools);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load tools.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [toast]);
  
  useEffect(() => {
    setSearchQuery(searchQueryParam);
    setActiveCategory(categoryQueryParam);
  }, [searchQueryParam, categoryQueryParam]);

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: allTools.length };
    toolCategories.forEach(cat => {
      counts[cat.id] = allTools.filter(tool => tool.category === cat.id).length;
    });
    return counts;
  }, [allTools]);


  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
      const searchMatch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [allTools, activeCategory, searchQuery]);
  
  const handleCategoryClick = (category: ToolCategory | 'all') => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/tools?${params.toString()}`, { scroll: false });
  };
  
   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`/tools?${params.toString()}`, { scroll: false });
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your one-stop-shop for productivity and creativity. Explore our suite of 100+ tools.
        </p>
      </div>

      <div className="mt-12 sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 py-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="q"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a tool..."
            className="w-full h-14 pl-12 pr-40 rounded-full text-lg shadow-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Select value={activeCategory} onValueChange={handleCategoryClick}>
                <SelectTrigger className="w-[180px] h-10 rounded-full">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                All Categories
                           </div>
                           <span className="text-xs text-muted-foreground">{categoryCounts['all']}</span>
                        </div>
                    </SelectItem>
                    {toolCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <cat.Icon className="h-4 w-4" />
                                    {cat.name}
                                </div>
                                <span className="text-xs text-muted-foreground">{categoryCounts[cat.id] || 0}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        ) : filteredTools.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
        ) : (
             <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No tools found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
}
