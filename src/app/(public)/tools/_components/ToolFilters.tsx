
'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid } from 'lucide-react';
import { toolCategories } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Tool } from '@/ai/flows/tool-management.types';

interface ToolFiltersProps {
  tools: Tool[];
  onFilterChange: (filters: { query: string; category: string }) => void;
}

export function ToolFilters({ tools, onFilterChange }: ToolFiltersProps) {
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ query: e.target.value, category: initialCategory });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ query: initialQuery, category: category });
  };

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: tools.length };
    tools.forEach(tool => {
        counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, [tools]);


  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-2xl mx-auto">
        <div className="relative w-full flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            defaultValue={initialQuery}
            onChange={handleSearchChange}
            placeholder="Search for a tool..."
            className="w-full pl-12 pr-4 sm:pr-44 h-14 text-base rounded-full shadow-lg focus:border-primary"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
             <Select defaultValue={initialCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-auto h-10 rounded-full shadow-inner bg-muted/50 border-0">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            All Categories ({categoryCounts.all || 0})
                        </div>
                    </SelectItem>
                    {toolCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                            <cat.Icon className="h-4 w-4" />
                            {cat.name} ({categoryCounts[cat.id] || 0})
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
