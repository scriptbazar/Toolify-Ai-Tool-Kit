
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid } from 'lucide-react';
import { toolCategories } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ToolFiltersProps {
  searchQuery: string;
  activeCategory: string;
}

export function ToolFilters({ searchQuery, activeCategory }: ToolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const createQueryString = (params: Record<string, string | null>) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    }
    return currentParams.toString();
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      router.push(`/tools?${createQueryString({ q: query, page: null })}`);
  }
  
  const handleCategoryChange = (category: string) => {
    router.push(`/tools?${createQueryString({ category: category === 'all' ? null : category, page: null })}`);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative w-full flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a tool..."
            className="w-full pl-12 h-12 text-base rounded-full shadow-md"
          />
        </form>
         <Select value={activeCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[220px] h-12 rounded-full shadow-md text-base">
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
  );
}
