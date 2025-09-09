
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getTools, upsertTool, deleteTool } from '@/ai/flows/tool-management';
import { UpsertToolInputSchema, type Tool, type ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Loader2, Save, ArrowLeft, Trash2, Package, CheckCircle, XCircle, Star, Sparkles, Construction } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const EditToolFormSchema = UpsertToolInputSchema.extend({
    isNew: z.boolean().default(false),
    status: z.enum(['Active', 'Disabled', 'Maintenance', 'Coming Soon']).default('Active'),
});

type EditToolFormValues = z.infer<typeof EditToolFormSchema>;


export default function EditToolPage() {
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const toolId = params.id as string;
    const isNewTool = toolId === 'new';

    const form = useForm<EditToolFormValues>({
        resolver: zodResolver(EditToolFormSchema),
        defaultValues: {
            name: '',
            description: '',
            icon: 'HelpCircle',
            category: 'text',
            plan: 'Free',
            isNew: false,
            status: 'Active',
        },
    });
    
    const selectedIcon = form.watch('icon');
    const IconComponent = (Icons as any)[selectedIcon] || Icons.HelpCircle;

    useEffect(() => {
        if (isNewTool) {
            setLoading(false);
            return;
        }

        async function fetchTool() {
            setLoading(true);
            try {
                const tools = await getTools();
                const foundTool = tools.find(t => t.id === toolId || t.slug === toolId);
                if (foundTool) {
                    setTool(foundTool);
                    form.reset({
                        name: foundTool.name,
                        description: foundTool.description,
                        icon: foundTool.icon,
                        category: foundTool.category,
                        plan: foundTool.plan,
                        isNew: foundTool.isNew,
                        status: foundTool.status,
                    });
                } else {
                    toast({ title: 'Error', description: 'Tool not found.', variant: 'destructive' });
                    router.push('/admin/tools');
                }
            } catch (error) {
                console.error('Failed to fetch tool:', error);
                toast({ title: 'Error', description: 'Could not load tool data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
        fetchTool();
    }, [toolId, isNewTool, router, toast, form]);
    
    const onSubmit: SubmitHandler<EditToolFormValues> = async (data) => {
        setIsSaving(true);
        try {
            const toolData = {
                id: isNewTool ? undefined : tool?.id,
                ...data,
            };
            const result = await upsertTool(toolData);
            if (result.success) {
                toast({
                    title: `Tool ${isNewTool ? 'added' : 'updated'} successfully!`,
                    description: `The tool "${data.name}" has been saved.`,
                });
                router.push('/admin/tools');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Failed to save tool:', error);
            toast({ title: 'Error', description: error.message || 'Could not save tool.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!tool || isNewTool) return;
        setIsDeleting(true);
        try {
            const result = await deleteTool(tool.id);
            if (result.success) {
                toast({ title: 'Tool Deleted', description: `The tool "${tool.name}" has been deleted.` });
                router.push('/admin/tools');
            } else {
                 throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Could not delete tool.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    }


    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
                <Card><CardContent><Skeleton className="h-96 w-full" /></CardContent></Card>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back To Tools
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{isNewTool ? 'Add New Tool' : `Edit Tool: ${tool?.name}`}</h1>
                    <p className="text-muted-foreground">
                        {isNewTool ? 'Create a new tool for your users.' : 'Modify the details of an existing tool.'}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tool Details</CardTitle>
                            <CardDescription>Provide the core information for your tool.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Tool Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Case Converter" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {toolCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="icon" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 flex items-center justify-center rounded-lg border bg-muted">
                                                <IconComponent className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., 'FileText'" />
                                                </FormControl>
                                            </div>
                                        </div>
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="A short description of what this tool does." /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Set the plan, status, and visibility options for this tool.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField control={form.control} name="plan" render={({ field }) => (
                                <FormItem><FormLabel className="mb-2 block">Plan</FormLabel>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                        <Label htmlFor="plan-free" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Free" id="plan-free" /><Package className="h-5 w-5" /><div className="flex-1"><p>Free</p><p className="text-xs text-muted-foreground">Accessible to all users.</p></div></Label>
                                        <Label htmlFor="plan-pro" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Pro" id="plan-pro" /><Star className="h-5 w-5 text-yellow-500" /><div className="flex-1"><p>Pro</p><p className="text-xs text-muted-foreground">Requires a subscription.</p></div></Label>
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )} />
                           <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel className="mb-2 block">Status</FormLabel>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                        <Label htmlFor="status-active" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Active" id="status-active" /><CheckCircle className="h-5 w-5 text-green-500" /><div className="flex-1"><p>Active</p><p className="text-xs text-muted-foreground">Visible to users.</p></div></Label>
                                        <Label htmlFor="status-disabled" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Disabled" id="status-disabled" /><XCircle className="h-5 w-5 text-red-500" /><div className="flex-1"><p>Disabled</p><p className="text-xs text-muted-foreground">Hidden from users.</p></div></Label>
                                        <Label htmlFor="status-maintenance" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Maintenance" id="status-maintenance" /><Construction className="h-5 w-5 text-yellow-500" /><div className="flex-1"><p>Maintenance</p><p className="text-xs text-muted-foreground">Show maintenance page.</p></div></Label>
                                        <Label htmlFor="status-coming-soon" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Coming Soon" id="status-coming-soon" /><Sparkles className="h-5 w-5 text-blue-500" /><div className="flex-1"><p>Coming Soon</p><p className="text-xs text-muted-foreground">Show coming soon page.</p></div></Label>
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="isNew" render={({ field }) => (
                                <FormItem><FormLabel className="mb-2 block">Highlight</FormLabel>
                                <div className="flex items-center gap-2 rounded-lg border p-2 h-full">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    <div className="flex-1"><FormLabel>Mark as New</FormLabel><p className="text-xs text-muted-foreground">Display a "New" badge on the tool card.</p></div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </div>
                                <FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center">
                        <div>
                        {!isNewTool && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Tool
                            </Button>
                        )}
                        </div>
                        <div className="flex gap-2">
                           <Button type="button" variant="outline" onClick={() => router.push('/admin/tools')}>Cancel</Button>
                           <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                {isNewTool ? 'Add Tool' : 'Save Changes'}
                           </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
