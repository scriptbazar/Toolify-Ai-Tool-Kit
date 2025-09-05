
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search } from 'lucide-react';
import { CategoryCard } from '@/components/tools/CategoryCard';

export default async function ToolsDashboardPage() {
  const allTools = await getTools();
  const activeTools = allTools.filter(tool => tool.status === 'Active');

  const toolsByCategory: { [key in ToolCategory]?: Tool[] } = {};
  
  activeTools.forEach(tool => {
    if (!toolsByCategory[tool.category]) {
      toolsByCategory[tool.category] = [];
    }
    toolsByCategory[tool.category]!.push(tool);
  });

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
          <p className="w-full h-14 pl-12 pr-4 rounded-full text-lg shadow-lg bg-muted flex items-center text-muted-foreground">
              Search is coming soon...
          </p>
        </div>
      </div>
      
       <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
         {toolCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
         ))}
      </div>


      <div className="mt-12 space-y-12">
        {toolCategories.map(category => {
          const categoryTools = toolsByCategory[category.id];
          if (!categoryTools || categoryTools.length === 0) {
            return null;
          }
          return (
            <section key={category.id} id={category.id} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <category.Icon className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categoryTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  );
}
