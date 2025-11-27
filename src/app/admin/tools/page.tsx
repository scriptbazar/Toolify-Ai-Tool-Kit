
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
import { AdminToolTableClient } from './_components/AdminToolTableClient';
import { unstable_noStore as noStore } from 'next/cache';


export default async function AdminToolsPage() {
    noStore();
    const allTools = await getTools({status: 'all'});
    
    // The onToolUpdate function will be handled on the client via router.refresh
    const handleToolUpdate = () => {
        'use server';
        // This is a placeholder for a potential server-side revalidation if needed
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
                    <AdminToolTableClient 
                        allTools={allTools}
                        onToolUpdate={handleToolUpdate} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
