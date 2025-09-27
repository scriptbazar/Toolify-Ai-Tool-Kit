
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
    
    const searchQuery = (searchParams.get('q') as string) || '';
    const activeCategory = (searchParams.get('category') as ToolCategory) || 'all';
    const activeFilter = (searchParams.get('filter') as string) || 'all';

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
                         <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <AdminToolTable tools={filteredTools} onToolUpdate={fetchTools} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
