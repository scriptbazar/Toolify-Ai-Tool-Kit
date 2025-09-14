
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid } from 'lucide-react';
import { toolCategories } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ToolFiltersProps {
  searchQuery: string;
  activeCategory: string;
  categoryCounts: { [key: string]: number };
}

export function ToolFilters({ searchQuery, activeCategory, categoryCounts }: ToolFiltersProps) {
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

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a tool..."
          className="w-full pl-12 h-12 text-base rounded-full shadow-md"
        />
      </form>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => router.push(`/tools?${createQueryString({ category: null, page: null })}`)}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          All ({categoryCounts['all'] || 0})
        </Button>
        {toolCategories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => router.push(`/tools?${createQueryString({ category: category.id, page: null })}`)}
          >
            <category.Icon className="mr-2 h-4 w-4" />
            {category.name} ({categoryCounts[category.id] || 0})
          </Button>
        ))}
      </div>
    </div>
  );
}
