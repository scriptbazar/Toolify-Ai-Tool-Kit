'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getTools, upsertTool } from '@/ai/flows/tool-management';
import { EditToolForm } from './EditToolForm';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tool } from '@/ai/flows/tool-management.types';


export default function EditToolPage() {
    const params = useParams();
    const id = params.id as string;
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchTool() {
            if (id) {
                const allTools = await getTools({ slug: id, status: 'all' });
                const foundTool = allTools.length > 0 ? allTools[0] : null;
                if (foundTool) {
                    setTool(foundTool);
                } else {
                    toast({ title: "Tool not found", variant: 'destructive'});
                    router.push('/admin/tools');
                }
            }
             setLoading(false);
        }
        fetchTool();
    }, [id, router, toast]);

    const handleSave = async (data: any) => {
        const toolData = {
          id, // Pass the existing id for update
          ...data,
        };
        const result = await upsertTool(toolData);
        if (result.success) {
            toast({
                title: 'Tool Updated!',
                description: `The tool "${data.name}" has been successfully updated.`,
            });
            router.push('/admin/tools');
            router.refresh();
            return true;
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
            return false;
        }
    };
    
    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        )
    }

    if (!tool) {
        return <div>Tool not found.</div>
    }
    
    return (
        <div className="space-y-6">
            <Link href="/admin/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back To All Tools
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Edit: {tool.name}</h1>
            <EditToolForm onSave={handleSave} tool={tool}/>
        </div>
    );
}
