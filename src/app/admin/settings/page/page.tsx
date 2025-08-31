
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
import type { CustomPage } from '@/ai/flows/settings-management.types';
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

const defaultPages: CustomPage[] = [
    { 
        id: 'about-us', 
        slug: 'about-us', 
        title: 'About Us',
        content: `
          <div class="text-center py-12 px-4">
            <h2 class="text-3xl font-bold sm:text-4xl">Our Mission</h2>
            <p class="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">Our mission is to provide powerful, intuitive, and accessible tools that empower users to achieve their goals with greater efficiency and creativity. We believe in simplifying complex tasks and making smart technology available to everyone, from developers and designers to students and business professionals.</p>
          </div>
          <div class="py-12">
            <div class="container mx-auto px-4 text-center">
              <h2 class="text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Meet The Team
              </h2>
              <p class="mt-4 text-lg text-muted-foreground">The passionate individuals behind AI Smart Tools, dedicated to building the best platform for you.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-12">
                <div class="text-center">
                  <img class="mx-auto h-24 w-24 rounded-full" src="https://i.pravatar.cc/150?u=rohan" alt="Rohan Sharma" />
                  <h3 class="mt-4 text-lg font-semibold text-foreground">Rohan Sharma</h3>
                  <p class="text-primary">Founder & CEO</p>
                </div>
                <div class="text-center">
                  <img class="mx-auto h-24 w-24 rounded-full" src="https://i.pravatar.cc/150?u=priya" alt="Priya Verma" />
                  <h3 class="mt-4 text-lg font-semibold text-foreground">Priya Verma</h3>
                  <p class="text-primary">Lead Developer</p>
                </div>
                <div class="text-center">
                  <img class="mx-auto h-24 w-24 rounded-full" src="https://i.pravatar.cc/150?u=amit" alt="Amit Kumar" />
                  <h3 class="mt-4 text-lg font-semibold text-foreground">Amit Kumar</h3>
                  <p class="text-primary">Head of Product</p>
                </div>
                <div class="text-center">
                  <img class="mx-auto h-24 w-24 rounded-full" src="https://i.pravatar.cc/150?u=sunita" alt="Sunita Singh" />
                  <h3 class="mt-4 text-lg font-semibold text-foreground">Sunita Singh</h3>
                  <p class="text-primary">Marketing Lead</p>
                </div>
                <div class="text-center">
                  <img class="mx-auto h-24 w-24 rounded-full" src="https://i.pravatar.cc/150?u=anjali" alt="Anjali Sharma" />
                  <h3 class="mt-4 text-lg font-semibold text-foreground">Anjali Sharma</h3>
                  <p class="text-primary">UI/UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        `
    },
    { id: 'contact-us', slug: 'contact-us', title: 'Contact Us', content: '' },
    { id: 'privacy-policy', slug: 'privacy-policy', title: 'Privacy Policy', content: '' },
    { id: 'terms-conditions', slug: 'terms-conditions', title: 'Terms & Conditions', content: '' },
    { id: 'dmca', slug: 'dmca', title: 'DMCA', content: '' },
];

export default function PageManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
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
            const existingPage = pageSettings.pages?.find(p => p.id === defaultPage.id);
            return existingPage ? { ...defaultPage, ...existingPage } : { ...defaultPage, content: defaultPage.content || ''};
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
    setOpenSection(prev => (prev === id ? null : id));
  };
  
  const renderPageCollapsible = (field: Record<"fieldId", string>, index: number) => {
    const isOpen = openSection === field.id;
    return (
       <Collapsible
          key={field.fieldId}
          open={isOpen}
          onOpenChange={() => handleToggle(field.id)}
          className={cn(
              "space-y-2 col-span-1",
              isOpen ? "md:col-span-2" : "md:col-span-1"
          )}
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
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
    )
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => {
              const anySectionOpen = openSection !== null;
              const thisSectionOpen = openSection === field.id;
              
              if (anySectionOpen && !thisSectionOpen) {
                  return null;
              }
              return renderPageCollapsible(field as any, index);
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
    </div>
  );
}
