
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, PlusCircle, Trash2, Edit2, FileCog, FileText, Link as LinkIcon, ChevronDown, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { PageSettingsSchema, type CustomPage } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


const pageManagementFormSchema = z.object({
    pages: z.array(z.object({
        id: z.string(),
        slug: z.string().min(1, "Slug is required."),
        title: z.string().min(1, "Title is required."),
        content: z.string().optional(),
    })).optional(),
});

type PageManagementFormValues = z.infer<typeof pageManagementFormSchema>;

export default function PageManagementPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [openPageId, setOpenPageId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<PageManagementFormValues>({
        resolver: zodResolver(pageManagementFormSchema),
        defaultValues: {
            pages: [],
        },
    });

     const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'pages'
    });

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const settings = await getSettings();
                if (settings.page) {
                    form.reset(settings.page);
                }
            } catch (error) {
                console.error('Failed to fetch page settings:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load page settings.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [form, toast]);

    const onSubmit = async (data: PageManagementFormValues) => {
        setIsSaving(true);
        try {
            await updateSettings({ page: data });
            toast({
                title: 'Success!',
                description: 'Page settings have been saved.',
            });
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            toast({
                title: 'Error',
                description: error.message || 'Could not save settings.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddNewPage = () => {
        const newPageId = `page_${Date.now()}`;
        append({ id: newPageId, slug: '', title: '', content: '' });
        setOpenPageId(newPageId);
    };
    
    const handleTitleChange = (index: number, title: string) => {
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        form.setValue(`pages.${index}.title`, title);
        form.setValue(`pages.${index}.slug`, slug);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Page Management</h1>
                        <p className="text-muted-foreground">
                            Create, edit, and manage custom pages on your site.
                        </p>
                    </div>
                    <div className="flex gap-2">
                         <Button type="button" variant="outline" onClick={handleAddNewPage}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Page
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save All Changes
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Pages</CardTitle>
                        <CardDescription>Click on a page to expand and edit its content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {fields.map((field, index) => {
                                const isOpen = openPageId === field.id;
                                return (
                                <Collapsible
                                    key={field.id}
                                    open={isOpen}
                                    onOpenChange={() => setOpenPageId(isOpen ? null : field.id)}
                                    className={cn("space-y-2 transition-all duration-300", isOpen && "lg:col-span-2")}
                                >
                                    <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                                        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <CollapsibleTrigger asChild>
                                             <div className="flex-1 text-left cursor-pointer">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-medium truncate flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        {form.watch(`pages.${index}.title`) || 'New Page'}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <LinkIcon className="h-3 w-3" />
                                                            /{form.watch(`pages.${index}.slug`)}
                                                        </div>
                                                        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>
                                         <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                     <CollapsibleContent>
                                        <div className="p-4 border rounded-lg -mt-2 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`pages.${index}.title`}
                                                    render={({ field: titleField }) => (
                                                        <FormItem>
                                                            <FormLabel>Page Title</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    {...titleField} 
                                                                    onChange={(e) => handleTitleChange(index, e.target.value)}
                                                                    placeholder="e.g., About Us" 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                 <FormField
                                                    control={form.control}
                                                    name={`pages.${index}.slug`}
                                                    render={({ field: slugField }) => (
                                                        <FormItem>
                                                            <FormLabel>Page Slug (URL)</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    {...slugField}
                                                                    placeholder="e.g., about-us" 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <FormField
                                                control={form.control}
                                                name={`pages.${index}.content`}
                                                render={({ field: contentField }) => (
                                                    <FormItem>
                                                        <FormLabel>Page Content (HTML supported)</FormLabel>
                                                        <FormControl>
                                                            <Textarea 
                                                                {...contentField}
                                                                placeholder="Enter your page content here. You can use HTML tags like <p>, <h2>, <ul>, etc."
                                                                className="min-h-[250px] font-mono"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                     </CollapsibleContent>
                                </Collapsible>
                            )})}
                        </div>
                         {fields.length === 0 && (
                            <p className="text-center text-muted-foreground py-10">No custom pages have been created yet.</p>
                        )}
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
