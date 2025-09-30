
import { getTools } from '@/ai/flows/tool-management';
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
import { AdminToolTable } from '@/components/tools/AdminToolTable';


export const revalidate = 0; // Disable caching for this page

export default async function AdminToolsPage() {
    const allTools = await getTools();

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
                    <AdminToolTable allTools={allTools} />
                </CardContent>
            </Card>
        </div>
    );
}
