

import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { ToolFilters } from './_components/ToolFilters';
import { ToolGrid } from './_components/ToolGrid';


export default async function ToolsDashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const searchQuery = searchParams?.q ?? '';
  const activeCategory = searchParams?.category ?? 'all';

  // Fetch only the tools that match the search criteria from the server
  const filteredTools = await getTools({
    query: searchQuery as string,
    category: activeCategory as ToolCategory,
  });

  // This is for the filter component to show counts for all visible tools.
  // Instead of fetching all tools again, we can derive counts for categories
  // from the already fetched filtered tools if we wanted to optimize further,
  // but for accurate total counts, fetching all is necessary. Let's keep fetching all for now,
  // but be mindful of performance. A better approach would be a dedicated count query.
  const allVisibleTools = await getTools();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Our Tools</h1>
        <p className="mt-4 text-muted-foreground">
          Discover our comprehensive suite of 100+ powerful and easy-to-use tools.
        </p>
      </div>

      <ToolFilters 
        tools={allVisibleTools}
      />
      
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </div>
  );
}


      

    

    

