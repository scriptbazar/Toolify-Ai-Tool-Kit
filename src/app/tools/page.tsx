
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ToolsDashboardPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      const allTools = await getTools();
      const activeTools = allTools.filter(tool => tool.status === 'Active');
      setTools(activeTools);
      setLoading(false);
    }
    fetchTools();
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
      const searchMatch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [tools, searchQuery, activeCategory]);
  
  const categoriesToShow = ['all', ...toolCategories.map(c => c.id)];
  const categoryDetails = {
    'all': { name: 'All', Icon: Search },
    ...toolCategories.reduce((acc, cat) => ({...acc, [cat.id]: { name: cat.name.replace(' Tools', ''), Icon: cat.Icon }}), {})
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your one-stop-shop for productivity and creativity.
        </p>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search tools by name or description..."
            className="w-full h-14 pl-12 pr-4 rounded-full text-lg shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
       <div className="mt-8 flex justify-center flex-wrap gap-2">
         {categoriesToShow.map(catId => {
            const details = categoryDetails[catId as keyof typeof categoryDetails];
            if (!details) return null;
            
            return (
                 <Button 
                    key={catId} 
                    variant={activeCategory === catId ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(catId as ToolCategory | 'all')}
                    className={cn(
                        "rounded-full transition-all",
                        activeCategory === catId && "shadow-md"
                    )}
                >
                    <details.Icon className="mr-2 h-4 w-4"/>
                    {details.name}
                 </Button>
            )
         })}
      </div>


      <div className="mt-12">
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
