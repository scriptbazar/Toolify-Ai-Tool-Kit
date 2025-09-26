'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { ToolFilters } from './ToolFilters';
import { ToolGrid } from './ToolGrid';

interface ToolsPageClientProps {
  allTools: Tool[];
}

export function ToolsPageClient({ allTools }: ToolsPageClientProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const activeCategory = (searchParams.get('category') as ToolCategory) || 'all';

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
      const searchMatch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [allTools, activeCategory, searchQuery]);

  return (
    <>
      <ToolFilters tools={allTools} />
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </>
  );
}