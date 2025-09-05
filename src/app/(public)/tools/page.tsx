
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export default async function ToolsDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allTools = await getTools();
  const activeTools = allTools.filter(tool => tool.status === 'Active');

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const activeCategory = typeof searchParams.category === 'string' ? searchParams.category as ToolCategory : 'all';

  const filteredTools = activeTools.filter(tool => {
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

      <div className="mt-12 sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 py-4">
        <form className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search for a tool..."
            className="w-full h-12 pl-12 pr-4 rounded-full text-lg shadow-lg"
          />
        </form>
        <div className="flex justify-center flex-wrap gap-2">
          <Link href="/tools" scroll={false}>
            <Button variant={activeCategory === 'all' ? 'default' : 'outline'}>
              All Tools
            </Button>
          </Link>
          {toolCategories.map(category => (
            <Link key={category.id} href={`?category=${category.id}`} scroll={false}>
              <Button
                variant={activeCategory === category.id ? 'default' : 'outline'}
              >
                <category.Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        {filteredTools.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
        ) : (
             <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No tools found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
}
