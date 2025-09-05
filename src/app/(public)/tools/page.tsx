
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ToolsDashboardPage() {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      try {
        const tools = await getTools();
        const activeTools = tools.filter(tool => tool.status === 'Active');
        setAllTools(activeTools);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
        toast({
          title: 'Error',
          description: 'Could not load the available tools.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, [toast]);
  
  const filteredTools = useMemo(() => {
      return allTools.filter(tool => {
        const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
        const searchMatch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && searchMatch;
      });
  }, [allTools, searchQuery, activeCategory]);
  

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your one-stop-shop for productivity and creativity. Explore our suite of 100+ tools.
        </p>
      </div>

      <div className="mt-12 sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 py-4">
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for a tool..."
            className="w-full h-12 pl-12 pr-4 rounded-full text-lg shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-center flex-wrap gap-2">
            <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveCategory('all')}
            >
                All Tools
            </Button>
          {toolCategories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category.id)}
            >
              <category.Icon className="mr-2 h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
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
