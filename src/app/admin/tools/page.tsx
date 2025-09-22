
import { getTools } from '@/ai/flows/tool-management';
import type { Tool, ToolCategory } from '@/ai/flows/tool-management.types';
import { AdminToolFilters } from './_components/AdminToolFilters';
import { AdminToolTable } from './_components/AdminToolTable';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const ITEMS_PER_PAGE = 10;

// This is a server component now.
export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // We get the search params directly on the server.
  const searchQuery = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const activeCategory = typeof searchParams?.category === 'string' ? searchParams.category as ToolCategory : 'all';
  const activeFilter = typeof searchParams?.filter === 'string' ? searchParams.filter : 'all';
  const currentPage = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;

  // Fetch ALL tools once for filter counts.
  const allTools = await getTools();
  
  // Apply all filters on the server-side
  const filteredTools = allTools
    .filter(tool => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pro') return tool.plan === 'Pro';
        if (activeFilter === 'free') return tool.plan === 'Free';
        if (activeFilter === 'new') return tool.isNew;
        // This handles status filters like 'Active', 'Beta', etc.
        return tool.status.toLowerCase() === activeFilter.toLowerCase();
    })
    .filter(tool => {
      if (activeCategory === 'all') return true;
      return tool.category === activeCategory;
    })
    .filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const createQueryString = (params: Record<string, string | number | null>) => {
    const currentParams = new URLSearchParams();
    if(searchParams){
      for(const [key, value] of Object.entries(searchParams)){
        if(value && typeof value === 'string') currentParams.set(key, value);
      }
    }

    for (const [key, value] of Object.entries(params)) {
      if (value === null || (key === 'page' && value === 1)) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(value));
      }
    }
    const queryString = currentParams.toString();
    return queryString ? `?${queryString}` : '';
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Management</h1>
          <p className="text-muted-foreground">
            View, manage, and filter all available tools.
          </p>
        </div>
         <Button asChild>
            <Link href="/admin/tools/new"><PlusCircle className="mr-2 h-4 w-4"/>Add New Tool</Link>
         </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Tools</CardTitle>
          <CardDescription>A comprehensive list of all tools available in the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading filters...</div>}>
            <AdminToolFilters allTools={allTools} />
          </Suspense>
          
          <AdminToolTable tools={paginatedTools} />
          
           {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button asChild variant="outline" size="sm" disabled={currentPage <= 1}>
                 <Link href={`/admin/tools${createQueryString({ page: currentPage - 1 })}`} scroll={false}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                 </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages}>
                <Link href={`/admin/tools${createQueryString({ page: currentPage + 1 })}`} scroll={false}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
