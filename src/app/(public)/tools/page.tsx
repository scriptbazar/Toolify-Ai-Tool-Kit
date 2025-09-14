

import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolFilters } from './_components/ToolFilters';
import { ToolGrid } from './_components/ToolGrid';


export default async function ToolsDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const allTools = await getTools();
  const visibleTools = allTools.filter(tool => tool.status !== 'Disabled');

  const searchQuery = searchParams.q || '';
  const activeCategory = (searchParams.category as ToolCategory) || 'all';

  const categoryCounts: { [key: string]: number } = { all: visibleTools.length };
  toolCategories.forEach(cat => {
    categoryCounts[cat.id] = visibleTools.filter(tool => tool.category === cat.id).length;
  });

  const filteredTools = visibleTools.filter(tool => {
    const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
    const searchMatch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your one-stop-shop for productivity and creativity. Explore our suite of 100+ tools.
        </p>
      </div>

      <ToolFilters 
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        categoryCounts={categoryCounts}
      />
      
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </div>
  );
}
