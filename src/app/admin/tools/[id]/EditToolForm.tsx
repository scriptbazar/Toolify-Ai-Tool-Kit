
'use client';

import { useState } from 'react';
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
import { type Tool, type ToolCategory } from '@/ai/flows/tool-management.types';
import { toolCategories } from '@/lib/constants';
import { Loader2, Save, Package, CheckCircle, XCircle, Star, Sparkles, Construction, GitCommitVertical, FlaskConical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const EditToolFormSchema = z.object({
    name: z.string().min(1, 'Tool name is required'),
    description: z.string().min(1, 'Description is required'),
    icon: z.string().min(1, 'Icon name is required.'),
    category: z.enum(['text', 'pdf', 'ai', 'dev', 'image', 'seo', 'video', 'ecommerce', 'calculator', 'miscellaneous']),
    plan: z.enum(['Free', 'Pro']).default('Free'),
    isNew: z.boolean().default(false),
    status: z.enum(['Active', 'Disabled', 'Maintenance', 'Coming Soon', 'New Version', 'Beta']).default('Active'),
    howToUse: z.array(z.string()).optional(),
});

type EditToolFormValues = z.infer<typeof EditToolFormSchema>;

interface EditToolFormProps {
    tool?: Tool | null;
    onSave: (data: EditToolFormValues) => Promise<boolean>;
}

export function EditToolForm({ tool, onSave }: EditToolFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const isNewTool = !tool;

    const form = useForm<EditToolFormValues>({
        resolver: zodResolver(EditToolFormSchema),
        defaultValues: {
            name: tool?.name || '',
            description: tool?.description || '',
            icon: tool?.icon || 'HelpCircle',
            category: tool?.category || 'text',
            plan: tool?.plan || 'Free',
            isNew: tool?.isNew || false,
            status: tool?.status || 'Active',
            howToUse: tool?.howToUse || [],
        },
    });

    const selectedIcon = form.watch('icon');
    const IconComponent = (Icons as any)[selectedIcon] || Icons.HelpCircle;

    const onSubmit: SubmitHandler<EditToolFormValues> = async (data) => {
        setIsSaving(true);
        const success = await onSave(data);
        if (success && isNewTool) {
            form.reset();
        }
        setIsSaving(false);
    };

    return (
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
                                    <Label htmlFor="status-beta" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Beta" id="status-beta" /><FlaskConical className="h-5 w-5 text-orange-500" /><div className="flex-1"><p>Beta</p><p className="text-xs text-muted-foreground">Show 'Beta' badge.</p></div></Label>
                                    <Label htmlFor="status-new-version" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="New Version" id="status-new-version" /><GitCommitVertical className="h-5 w-5 text-blue-500" /><div className="flex-1"><p>New Version</p><p className="text-xs text-muted-foreground">Show 'New Version' badge.</p></div></Label>
                                    <Label htmlFor="status-coming-soon" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Coming Soon" id="status-coming-soon" /><Sparkles className="h-5 w-5 text-blue-500" /><div className="flex-1"><p>Coming Soon</p><p className="text-xs text-muted-foreground">Show coming soon page.</p></div></Label>
                                    <Label htmlFor="status-maintenance" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Maintenance" id="status-maintenance" /><Construction className="h-5 w-5 text-yellow-500" /><div className="flex-1"><p>Maintenance</p><p className="text-xs text-muted-foreground">Show maintenance page.</p></div></Label>
                                    <Label htmlFor="status-disabled" className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"><RadioGroupItem value="Disabled" id="status-disabled" /><XCircle className="h-5 w-5 text-red-500" /><div className="flex-1"><p>Disabled</p><p className="text-xs text-muted-foreground">Hidden from users.</p></div></Label>
                                </RadioGroup>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="space-y-4">
                            <FormField control={form.control} name="isNew" render={({ field }) => (
                                <FormItem><FormLabel className="mb-2 block">Highlight</FormLabel>
                                <div className="flex items-center gap-2 rounded-lg border p-2 h-fit">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    <div className="flex-1"><FormLabel>Mark as New</FormLabel><p className="text-xs text-muted-foreground">Display a "New" badge on the tool card.</p></div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </div>
                                <FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                        {isNewTool ? 'Add Tool' : 'Save Changes'}
                   </Button>
                </div>
            </form>
        </Form>
    );
}
