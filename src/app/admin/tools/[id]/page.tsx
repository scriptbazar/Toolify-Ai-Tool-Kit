

'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { upsertTool, getTools } from '@/ai/flows/tool-management';
import { UpsertToolInputSchema, type Tool } from '@/ai/flows/tool-management.types';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditToolForm } from './EditToolForm';

const EditToolFormSchema = UpsertToolInputSchema.extend({
    isNew: z.boolean().default(false),
    status: z.enum(['Active', 'Disabled', 'Maintenance', 'Coming Soon', 'New Version', 'Beta']).default('Active'),
    howToUse: z.array(z.string()).optional(),
});

type EditToolFormValues = z.infer<typeof EditToolFormSchema>;

export default function EditToolPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const toolSlug = params.id as string;
    const isNewTool = toolSlug === 'new';
    
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(!isNewTool);

    useEffect(() => {
        if (!isNewTool) {
            getTools({ slug: toolSlug }).then(tools => {
                if (tools.length > 0) {
                    setTool(tools[0]);
                } else {
                    toast({ title: 'Error', description: 'Tool not found.', variant: 'destructive'});
                }
                setLoading(false);
            });
        }
    }, [isNewTool, toolSlug, toast]);
    
    const handleSave = async (data: EditToolFormValues) => {
        const toolData = {
            id: isNewTool ? undefined : tool?.id,
            slug: tool?.slug, // Pass slug for existing tools to potentially update it based on name
            ...data,
        };
        const result = await upsertTool(toolData);
        if (result.success) {
            toast({
                title: `Tool ${isNewTool ? 'added' : 'updated'} successfully!`,
                description: `The tool "${data.name}" has been saved.`,
            });
            router.push('/admin/tools');
            router.refresh(); // Refresh the page to reflect changes
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        return result.success;
    };
    
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back To Tools
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{isNewTool ? 'Add New Tool' : 'Edit Tool'}</h1>
                    <p className="text-muted-foreground">
                        {isNewTool ? 'Create a new tool for your users.' : `Modify the details for "${tool?.name}".`}
                    </p>
                </div>
            </div>
            <EditToolForm tool={tool} onSave={handleSave} />
        </div>
    );
}
