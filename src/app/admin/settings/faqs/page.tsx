'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, PlusCircle, Trash2, GripVertical, HelpCircle, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { FaqSettingsSchema } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Icons from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const iconNames = Object.keys(Icons) as [string, ...string[]];

const FaqManagementFormSchema = z.object({
  contactFaqs: z.array(z.object({
      id: z.string(),
      icon: z.enum(iconNames),
      question: z.string().min(1, "Question is required."),
      answer: z.string().min(1, "Answer is required."),
  })).optional(),
  pricingFaqs: z.array(z.object({
      id: z.string(),
      icon: z.enum(iconNames),
      question: z.string().min(1, "Question is required."),
      answer: z.string().min(1, "Answer is required."),
  })).optional(),
   affiliateFaqs: z.array(z.object({
      id: z.string(),
      icon: z.enum(iconNames),
      question: z.string().min(1, "Question is required."),
      answer: z.string().min(1, "Answer is required."),
  })).optional(),
});

type FaqManagementFormValues = z.infer<typeof FaqManagementFormSchema>;

const FaqArrayEditor = ({ form, name, title }: { form: any, name: "contactFaqs" | "pricingFaqs" | "affiliateFaqs", title: string }) => {
    const { control } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });
    
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    const getNewItem = () => ({
        id: `${name}_${Date.now()}`,
        icon: 'HelpCircle' as const,
        question: '',
        answer: '',
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Click on a question to expand and edit it.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {fields.map((field, index) => {
                      const isOpen = openItemId === field.id;
                      return (
                        <Collapsible 
                            key={field.id}
                            open={isOpen}
                            onOpenChange={() => setOpenItemId(isOpen ? null : field.id)}
                            className={cn("space-y-2", isOpen && "lg:col-span-2")}
                        >
                          <div className="flex items-start gap-2 p-4 border rounded-lg bg-muted/50">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0 cursor-move" />
                            <CollapsibleTrigger className="flex-1 text-left">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium truncate">{form.watch(`${name}.${index}.question`) || 'New Question'}</p>
                                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                                </div>
                            </CollapsibleTrigger>
                             <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 border rounded-lg -mt-2 space-y-4">
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.icon`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Icon Name</FormLabel>
                                            <FormControl><Input {...formField} placeholder="e.g., HelpCircle" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.question`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Question</FormLabel>
                                            <FormControl><Input {...formField} placeholder="e.g., What is ToolifyAI?" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`${name}.${index}.answer`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Answer</FormLabel>
                                            <FormControl><Textarea {...formField} placeholder="Provide a clear and concise answer." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                  })}
                </div>
                 <Button type="button" variant="outline" onClick={() => {
                    const newItem = getNewItem();
                    append(newItem);
                    setOpenItemId(newItem.id);
                 }} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
                </Button>
            </CardContent>
        </Card>
    );
};


export default function FaqManagementPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const form = useForm<FaqManagementFormValues>({
        resolver: zodResolver(FaqManagementFormSchema),
        defaultValues: {
            contactFaqs: [],
            pricingFaqs: [],
            affiliateFaqs: [],
        },
    });

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const settings = await getSettings();
                if (settings.faqs) {
                    form.reset(settings.faqs);
                }
            } catch (error) {
                console.error('Failed to fetch FAQ settings:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load FAQ settings.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [form, toast]);
    
    const onSubmit = async (data: FaqManagementFormValues) => {
        setIsSaving(true);
        try {
            await updateSettings({ faqs: data });
            toast({
                title: 'Success!',
                description: 'FAQ settings have been saved.',
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
    
    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-64 w-full" />
        </div>
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">FAQs Management</h1>
                        <p className="text-muted-foreground">
                            Manage the Frequently Asked Questions for different pages of your site.
                        </p>
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
                
                 <Tabs defaultValue="contact">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="contact">Contact Us Page</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing Page</TabsTrigger>
                        <TabsTrigger value="affiliate">Affiliate Page</TabsTrigger>
                    </TabsList>
                    <TabsContent value="contact" className="mt-6">
                        <FaqArrayEditor form={form} name="contactFaqs" title="Contact Us Page FAQs" />
                    </TabsContent>
                     <TabsContent value="pricing" className="mt-6">
                        <FaqArrayEditor form={form} name="pricingFaqs" title="Pricing Page FAQs" />
                    </TabsContent>
                     <TabsContent value="affiliate" className="mt-6">
                        <FaqArrayEditor form={form} name="affiliateFaqs" title="Affiliate Program FAQs" />
                    </TabsContent>
                 </Tabs>
            </form>
        </Form>
    )
}
