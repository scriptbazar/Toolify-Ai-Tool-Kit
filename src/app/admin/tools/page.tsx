
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
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminToolTableClient } from './_components/AdminToolTable';
import { useRouter } from 'next/navigation';


export default function AdminToolsPage() {
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();


    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

    const fetchTools = async () => {
        setLoading(true);
        const tools = await getTools({status: 'all'});
        setAllTools(tools);
        setFilteredTools(tools); // Initialize with all tools
        setLoading(false);
    };
    
    // The onToolUpdate function now simply refreshes the page data from the server.
    const handleToolUpdate = () => {
        router.refresh();
    };


    useEffect(() => {
        fetchTools();
    }, []);

    useEffect(() => {
      setCurrentPage(1);
    }, [filteredTools.length > 0 && filteredTools[0]?.id]);

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
                    <AdminToolTableClient 
                        allTools={allTools}
                        filteredTools={filteredTools}
                        setFilteredTools={setFilteredTools}
                        onToolUpdate={handleToolUpdate} 
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
