
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Tool } from '@/ai/flows/tool-management.types';
import { ToolFilters } from './ToolFilters';
import { ToolGrid } from './ToolGrid';
import { useSearchParams } from 'next/navigation';

interface ToolsPageClientProps {
  allTools: Tool[];
}

export function ToolsPageClient({ allTools }: ToolsPageClientProps) {
  const searchParams = useSearchParams();
  const [filteredTools, setFilteredTools] = useState(allTools);

  useEffect(() => {
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';

    const tools = allTools.filter(tool => {
        const categoryMatch = category === 'all' || tool.category === category;
        const searchMatch = tool.name.toLowerCase().includes(query) ||
                            tool.description.toLowerCase().includes(query);
        return categoryMatch && searchMatch;
    });
    setFilteredTools(tools);
  }, [searchParams, allTools]);

  return (
    <>
      <ToolFilters tools={allTools} />
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </>
  );
}
