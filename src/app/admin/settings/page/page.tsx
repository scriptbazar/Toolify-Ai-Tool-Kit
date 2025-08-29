
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import type { PageSettings, CustomPage } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


const PageManagementFormSchema = z.object({
  pages: z.array(z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string().min(1, "Title is required."),
    content: z.string().optional(),
  }))
});

type PageManagementFormValues = z.infer<typeof PageManagementFormSchema>;

const defaultPages: Omit<CustomPage, 'content'>[] = [
    { id: 'about-us', slug: 'about-us', title: 'About Us' },
    { id: 'contact-us', slug: 'contact-us', title: 'Contact Us' },
    { id: 'privacy-policy', slug: 'privacy-policy', title: 'Privacy Policy' },
    { id: 'terms-conditions', slug: 'terms-conditions', title: 'Terms & Conditions' },
    { id: 'dmca', slug: 'dmca', title: 'DMCA' },
];

export default function PageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const form = useForm<PageManagementFormValues>({
    resolver: zodResolver(PageManagementFormSchema),
    defaultValues: { pages: [] }
  });

  const { fields } = useFieldArray({
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
        
        const mergedPages = defaultPages.map(defaultPage => {
            const existingPage = pageSettings.pages.find(p => p.id === defaultPage.id);
            return existingPage ? { ...defaultPage, ...existingPage } : { ...defaultPage, content: ''};
        });

        form.reset({ pages: mergedPages });

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
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
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
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Management</h1>
        <p className="text-muted-foreground">
          Edit the content of your static pages like "About Us" and "Privacy Policy".
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Collapsible
              key={field.fieldId}
              open={openSections[field.id]}
              onOpenChange={() => handleToggle(field.id)}
              className="space-y-2"
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <div className="flex w-full cursor-pointer items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                       <FileText className="h-5 w-5" />
                       <div>
                         <CardTitle>{field.title}</CardTitle>
                         <CardDescription className="mt-1">
                           Manage the content for the /{field.slug} page.
                         </CardDescription>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      {openSections[field.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`pages.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., About Our Company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`pages.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Content</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter the page content here. HTML is supported." className="min-h-[200px] font-mono" />
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
          ))}
          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Pages
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
