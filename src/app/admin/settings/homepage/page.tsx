
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, PlusCircle, Trash2, GripVertical, Star, User, MessageCircle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { HomepageSettingsSchema, type HomepageSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Icons from 'lucide-react';

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
  // Testimonials are now managed automatically via reviews
});

type HomepageFormValues = z.infer<typeof HomepageSettingsFormSchema>;

const DynamicSectionEditor = ({ control, name, title, fieldsConfig }: {
    control: any,
    name: "features" | "steps",
    title: string,
    fieldsConfig: { name: string, label: string, placeholder: string, component?: 'textarea' }[]
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const getNewItem = () => {
        const newItem: any = { id: `${name}_${Date.now()}` };
        fieldsConfig.forEach(field => {
            newItem[field.name] = '';
        });
        if (name === 'features' || name === 'steps') newItem.icon = 'HelpCircle';
        return newItem;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Drag and drop to reorder items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 p-4 border rounded-lg bg-muted/50">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-8 shrink-0" />
                        <div className="flex-grow space-y-4">
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
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append(getNewItem())}>
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
                            control={form.control}
                            name="steps"
                            title="Get Started in 4 Easy Steps"
                            fieldsConfig={[
                                { name: 'icon', label: 'Icon Name', placeholder: 'e.g., UserPlus' },
                                { name: 'title', label: 'Title', placeholder: 'e.g., Create Account' },
                                { name: 'description', label: 'Description', placeholder: 'Describe the step', component: 'textarea' }
                            ]}
                        />
                    </TabsContent>
                    <TabsContent value="features" className="mt-6">
                        <DynamicSectionEditor
                            control={form.control}
                            name="features"
                            title="Why Choose ToolifyAI? Section"
                            fieldsConfig={[
                                { name: 'icon', label: 'Icon Name', placeholder: 'e.g., Sparkles' },
                                { name: 'title', label: 'Title', placeholder: 'e.g., Comprehensive Toolset' },
                                { name: 'description', label: 'Description', placeholder: 'Describe the feature', component: 'textarea' }
                            ]}
                        />
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
