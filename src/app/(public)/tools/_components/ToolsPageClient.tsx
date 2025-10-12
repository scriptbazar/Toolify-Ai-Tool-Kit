
'use client';

import { useState, useMemo } from 'react';
import type { Tool } from '@/ai/flows/tool-management.types';
import { ToolFilters } from './ToolFilters';
import { ToolGrid } from './ToolGrid';

interface ToolsPageClientProps {
  allTools: Tool[];
}

export function ToolsPageClient({ allTools }: ToolsPageClientProps) {
  const [filters, setFilters] = useState({ query: '', category: 'all' });

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const categoryMatch = filters.category === 'all' || tool.category === filters.category;
      const searchMatch = tool.name.toLowerCase().includes(filters.query.toLowerCase()) ||
                          tool.description.toLowerCase().includes(filters.query.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [allTools, filters]);

  return (
    <>
      <ToolFilters tools={allTools} onFilterChange={setFilters} />
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </>
  );
}
