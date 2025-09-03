
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { FooterSettingsSchema, type FooterSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FooterFormValues = z.infer<typeof FooterSettingsSchema>;

const LinkArrayEditor = ({ control, name, title }: { control: any, name: "topTools" | "quickLinks" | "hostingLinks", title: string }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-lg">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                           <FormField
                              control={control}
                              name={`${name}.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl><Input {...field} placeholder="Link Name" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField
                              control={control}
                              name={`${name}.${index}.href`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl><Input {...field} placeholder="URL (e.g., /about-us)" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ id: `link_${Date.now()}`, name: '', href: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                </Button>
            </CardContent>
        </Card>
    )
}

export default function FooterManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(FooterSettingsSchema),
    defaultValues: {
      showLogo: true,
      description: '',
      topTools: [],
      quickLinks: [],
      hostingLinks: [],
      footerAdCode: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const settings = await getSettings();
        if (settings.footer) {
          form.reset(settings.footer);
        }
      } catch (error) {
        console.error('Failed to fetch footer settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load footer settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: FooterFormValues) => {
    setIsSaving(true);
    try {
      await updateSettings({ footer: data });
      toast({
        title: 'Success!',
        description: 'Footer settings have been saved.',
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Footer Management</h1>
          <p className="text-muted-foreground">
            Customize the content and links in your website's footer.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="showLogo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Show Footer Logo</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Footer Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="A short description about your site for the footer." />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Footer Ad Slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="footerAdCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Ad Code</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Paste your ad code here." className="font-mono" />
                                </FormControl>
                                 <FormDescription>This will appear in the footer if advertisements are enabled.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <LinkArrayEditor control={form.control} name="topTools" title="Top Tools Links" />
                 <LinkArrayEditor control={form.control} name="quickLinks" title="Quick Links" />
                 <LinkArrayEditor control={form.control} name="hostingLinks" title="Hosting Links" />
            </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Footer Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
