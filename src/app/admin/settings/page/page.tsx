
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, FileText, ChevronDown, ChevronUp, Trash2, Info, Mail, Shield, Gavel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { CustomPage } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const PageManagementFormSchema = z.object({
  pages: z.array(z.object({
    id: z.string(),
    slug: z.string().min(1, 'Slug is required.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
    title: z.string().min(1, "Title is required."),
    content: z.string().optional(),
  }))
});

type PageManagementFormValues = z.infer<typeof PageManagementFormSchema>;

const pageIcons: { [key: string]: React.ElementType } = {
  'about-us': Info,
  'contact-us': Mail,
  'privacy-policy': Shield,
  'terms-conditions': FileText,
  'dmca': Gavel,
  'default': FileText,
};

const getPageIcon = (slug: string) => {
    return pageIcons[slug] || pageIcons.default;
}

export default function PageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<PageManagementFormValues>({
    resolver: zodResolver(PageManagementFormSchema),
    defaultValues: { pages: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pages",
    keyName: "fieldId"
  });
  
  useEffect(() => {
    async function fetchPages() {
      setLoading(true);
      try {
        const settings = await getSettings();
        const pageSettings = settings.page || { pages: [] };
        
        form.reset({ pages: pageSettings.pages || [] });

      } catch (error) {
        console.error('Failed to fetch pages:', error);
        toast({
          title: 'Error',
          description: 'Could not load page settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPages();
  }, [toast, form]);

  const onSubmit = async (data: PageManagementFormValues) => {
    setIsSaving(true);
    try {
      await updateSettings({ page: { pages: data.pages } });
      toast({
        title: 'Success!',
        description: 'Page contents have been saved.',
      });
    } catch (error: any) {
      console.error('Failed to save pages:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save pages.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddNewPage = () => {
    const newId = `page_${Date.now()}`;
    append({
        id: newId,
        slug: '',
        title: '',
        content: '',
    });
    setOpenSections(prev => [...prev, newId]);
  }
  
  const handleTitleChange = (value: string, index: number) => {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
    form.setValue(`pages.${index}.title`, value);
    form.setValue(`pages.${index}.slug`, slug);
  };
  

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            </Card>
          ))}
        </div>
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
                Create and edit your site's static pages like "About Us" and "Privacy Policy".
                </p>
            </div>
            <Button type="button" onClick={handleAddNewPage}>
                Add New Page
            </Button>
        </div>
        
        <div className="space-y-4">
          {fields.map((field, index) => {
            const Icon = getPageIcon(form.watch(`pages.${index}.slug`));
            return (
              <Collapsible
                key={field.fieldId}
                open={openSections.includes(field.id)}
                onOpenChange={() => handleToggle(field.id)}
                className="space-y-2"
              >
                <Card>
                  <div className="flex w-full cursor-pointer items-center justify-between p-4">
                    <CollapsibleTrigger asChild className="flex-1 text-left">
                      <div className="flex items-center gap-4">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">{form.watch(`pages.${index}.title`) || 'New Page'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage the content for the /{form.watch(`pages.${index}.slug`) || '...'} page.
                          </p>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the page "{form.watch(`pages.${index}.title`)}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(index)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {openSections.includes(field.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <CardContent className="border-t pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                              control={form.control}
                              name={`pages.${index}.title`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Page Title</FormLabel>
                                  <FormControl>
                                  <Input {...field} placeholder="e.g., About Our Company" onChange={(e) => handleTitleChange(e.target.value, index)} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name={`pages.${index}.slug`}
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Page Slug (URL)</FormLabel>
                                  <FormControl>
                                  <Input {...field} placeholder="e.g., about-us" />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`pages.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Page Content</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value ?? ""} placeholder="Enter the page content here. HTML is supported." className="min-h-[250px] font-mono" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Pages
          </Button>
        </div>
      </form>
    </Form>
  );
}
