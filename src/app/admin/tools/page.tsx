
'use client';

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
import { PlusCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const ITEMS_PER_PAGE = 10;

async function revalidateTools() {
    'use server';
    revalidatePath('/admin/tools');
}

export default function AdminToolsPage() {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    const fetchTools = async () => {
        setLoading(true);
        const tools = await getTools();
        setAllTools(tools);
        setLoading(false);
    };

    useEffect(() => {
        fetchTools();
    }, []);
    
    const handleToolUpdate = () => {
        // Re-fetch tools after an update
        fetchTools();
    };

    const searchQuery = searchParams.get('q') || '';
    const activeCategory = (searchParams.get('category') as ToolCategory) || 'all';
    const activeFilter = searchParams.get('filter') || 'all';
    const currentPage = Number(searchParams.get('page') || 1);

    const filteredTools = useMemo(() => allTools
        .filter(tool => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'pro') return tool.plan === 'Pro';
            if (activeFilter === 'free') return tool.plan === 'Free';
            if (activeFilter === 'new') return tool.isNew;
            return tool.status.toLowerCase().replace(/\s/g, '') === activeFilter.toLowerCase();
        })
        .filter(tool => {
            if (activeCategory === 'all') return true;
            return tool.category === activeCategory;
        })
        .filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase())
        ), [allTools, activeFilter, activeCategory, searchQuery]);

    const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
    const paginatedTools = filteredTools.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const createQueryString = (params: Record<string, string | number | null>) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(params)) {
            if (value === null || (key === 'page' && value === 1)) {
                currentParams.delete(key);
            } else {
                currentParams.set(key, String(value));
            }
        }
        return currentParams.toString();
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
                    <Link href="/admin/tools/new"><PlusCircle className="mr-2 h-4 w-4" />Add New Tool</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Tools</CardTitle>
                    <CardDescription>A comprehensive list of all tools available in the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminToolFilters allTools={allTools} />
                    
                    {loading ? (
                         <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <AdminToolTable tools={paginatedTools} onToolUpdate={handleToolUpdate} />
                    )}
                    
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 pt-4">
                            <Button asChild variant="outline" size="sm" disabled={currentPage <= 1}>
                                <Link href={`/admin/tools?${createQueryString({ page: currentPage - 1 })}`} scroll={false}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Link>
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages}>
                                <Link href={`/admin/tools?${createQueryString({ page: currentPage + 1 })}`} scroll={false}>
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
