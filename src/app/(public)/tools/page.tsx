

import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { ToolFilters } from './_components/ToolFilters';
import { ToolGrid } from './_components/ToolGrid';


export default async function ToolsDashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const searchQuery = (searchParams?.q as string) || '';
  const activeCategory = (searchParams?.category as ToolCategory) || 'all';

  // Fetch ALL tools once on the server.
  const allTools = await getTools();

  // Perform filtering on the server side.
  const filteredTools = allTools.filter(tool => {
    const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
    const searchMatch = searchQuery === '' || 
                        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Our Tools</h1>
        <p className="mt-4 text-muted-foreground">
          Discover our comprehensive suite of 100+ powerful and easy-to-use tools.
        </p>
      </div>

      <ToolFilters 
        tools={allTools}
      />
      
      <div className="mt-8">
        <ToolGrid tools={filteredTools} />
      </div>
    </div>
  );
}


      

    

    

