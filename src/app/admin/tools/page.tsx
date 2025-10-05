
'use client';

import { useState, useEffect } from 'react';
import { getTools } from '@/ai/flows/tool-management';
import { type Tool } from '@/ai/flows/tool-management.types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AdminToolTable } from '@/app/admin/tools/_components/AdminToolTable';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const AdminToolTableDynamic = dynamic(() => import('@/app/admin/tools/_components/AdminToolTable').then(mod => mod.AdminToolTable), {
    loading: () => (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
});

export default function AdminToolsPage() {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTools = async () => {
        setLoading(true);
        const tools = await getTools();
        setAllTools(tools);
        setFilteredTools(tools); // Initially, filtered tools are all tools
        setLoading(false);
    };

    useEffect(() => {
        fetchTools();
    }, []);

    if (loading) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

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
                    <AdminToolTableDynamic 
                        allTools={allTools}
                        filteredTools={filteredTools}
                        setFilteredTools={setFilteredTools}
                        onToolUpdate={fetchTools} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
