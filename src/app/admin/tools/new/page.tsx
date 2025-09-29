
'use client';

import { EditToolForm } from '@/app/admin/tools/[id]/EditToolForm';
import { upsertTool } from '@/ai/flows/tool-management';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddNewToolPage() {
    const { toast } = useToast();
    const router = useRouter();

    const handleSave = async (data: any) => {
        const result = await upsertTool(data);
        if (result.success) {
            toast({
                title: 'Tool Added!',
                description: `The tool "${data.name}" has been successfully created.`,
            });
            router.push('/admin/tools');
            router.refresh(); // To ensure the list on the main page is updated
            return true;
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
            return false;
        }
    };
    
    return (
        <div className="space-y-6">
            <Link href="/admin/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back To All Tools
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Add New Tool</h1>
            <EditToolForm onSave={handleSave} />
        </div>
    );
}
