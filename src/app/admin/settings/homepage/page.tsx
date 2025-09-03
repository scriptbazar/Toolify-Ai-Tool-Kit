
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, PlusCircle, Trash2, GripVertical, Star, User, MessageCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { HomepageSettingsSchema, type HomepageSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Icons from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const iconNames = Object.keys(Icons) as [string, ...string[]];

const HomepageSettingsFormSchema = HomepageSettingsSchema.extend({
  features: z.array(z.object({
    id: z.string(),
    icon: z.enum(iconNames),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
  })).optional(),
  steps: z.array(z.object({
    id: z.string(),
    icon: z.enum(iconNames),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
  })).optional(),
});

type HomepageFormValues = z.infer<typeof HomepageSettingsFormSchema>;

const DynamicSectionEditor = ({ form, name, title }: {
    form: any,
    name: "features" | "steps",
    title: string,
}) => {
    const { control } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    const getNewItem = () => ({
        id: `${name}_${Date.now()}`,
        icon: 'HelpCircle' as const,
        title: '',
        description: '',
    });

    const fieldsConfig = [
        { name: 'icon', label: 'Icon Name', placeholder: 'e.g., UserPlus' },
        { name: 'title', label: 'Title', placeholder: 'e.g., Create Account' },
        { name: 'description', label: 'Description', placeholder: 'Describe the item', component: 'textarea' as const }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Click on an item to expand and edit it. Drag and drop to reorder is not yet supported.</CardDescription>
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
                                    <p className="font-medium truncate">{form.watch(`${name}.${index}.title`) || 'New Item'}</p>
                                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                                </div>
                            </CollapsibleTrigger>
                             <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 border rounded-lg -mt-2 space-y-4">
                               {fieldsConfig.map(config => (
                                <FormField
                                    key={`${field.id}-${config.name}`}
                                    control={control}
                                    name={`${name}.${index}.${config.name}`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>{config.label}</FormLabel>
                                            <FormControl>
                                                {config.component === 'textarea' ? (
                                                    <Textarea {...formField} placeholder={config.placeholder} />
                                                ) : (
                                                    <Input {...formField} placeholder={config.placeholder} />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
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
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </CardContent>
        </Card>
    );
};

export default function HomepageSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const form = useForm<HomepageFormValues>({
        resolver: zodResolver(HomepageSettingsFormSchema),
        defaultValues: {
            features: [],
            steps: [],
        },
    });

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const settings = await getSettings();
                if (settings.homepage) {
                    form.reset(settings.homepage);
                }
            } catch (error) {
                console.error('Failed to fetch homepage settings:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load homepage settings.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [form, toast]);

    const onSubmit = async (data: HomepageFormValues) => {
        setIsSaving(true);
        try {
            await updateSettings({ homepage: data });
            toast({
                title: 'Success!',
                description: 'Homepage settings have been saved.',
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
                        <h1 className="text-3xl font-bold tracking-tight">Homepage Settings</h1>
                        <p className="text-muted-foreground">
                            Customize the content displayed on your main homepage.
                        </p>
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>

                <Tabs defaultValue="steps">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="steps">4 Easy Steps</TabsTrigger>
                        <TabsTrigger value="features">Why Choose Us</TabsTrigger>
                    </TabsList>
                    <TabsContent value="steps" className="mt-6">
                        <DynamicSectionEditor
                            form={form}
                            name="steps"
                            title="Get Started in 4 Easy Steps"
                        />
                    </TabsContent>
                    <TabsContent value="features" className="mt-6">
                        <DynamicSectionEditor
                            form={form}
                            name="features"
                            title="Why Choose ToolifyAI? Section"
                        />
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
