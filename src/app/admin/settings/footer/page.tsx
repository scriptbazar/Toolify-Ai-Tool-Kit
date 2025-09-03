'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, PlusCircle, Trash2, GripVertical, CaseUpper, Footprints, SlidersHorizontal, ChevronDown, Link as LinkIcon, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import { FooterSettingsSchema, type FooterSettings } from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type FooterFormValues = z.infer<typeof FooterSettingsSchema>;

const LinkArrayEditor = ({ control, name }: { control: any, name: "topTools" | "quickLinks" | "hostingLinks" | "moreTools" }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    return (
        <div className="space-y-4 pt-0">
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
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
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ id: `link_${Date.now()}`, name: '', href: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Link
            </Button>
        </div>
    )
}

const CollapsibleSection = ({ id, title, description, children, isOpen, onToggle, isFullWidth, icon: Icon }: { id: string, title: string, description?: string, children: React.ReactNode, isOpen: boolean, onToggle: (id: string) => void, isFullWidth: boolean, icon: React.ElementType }) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(id)}
      className={cn(
        "space-y-2 transition-all duration-300",
        isFullWidth ? "md:col-span-2" : "col-span-1"
      )}
    >
      <Card>
        <CollapsibleTrigger asChild>
            <div className="flex w-full cursor-pointer items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-primary"/>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                    <span className="sr-only">Toggle</span>
                </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <CardContent>
                {children}
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default function FooterManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(FooterSettingsSchema),
    defaultValues: {
      showLogo: true,
      description: '',
      topToolsTitle: 'Top Tools',
      quickLinksTitle: 'Quick Links',
      hostingLinksTitle: 'Best Hostings',
      moreToolsTitle: 'More Tools',
      topTools: [],
      quickLinks: [],
      hostingLinks: [],
      moreTools: [],
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
  
  const handleToggle = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
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

  const sections = [
    { id: 'general', title: 'General Settings', description: "Manage logo and description", icon: SlidersHorizontal, children: (
      <div className="space-y-4">
        <FormField control={form.control} name="showLogo" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5"><FormLabel>Show Footer Logo</FormLabel></div>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Footer Description</FormLabel><FormControl><Textarea {...field} placeholder="A short description about your site for the footer." /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    )},
    { id: 'titles', title: 'Column Titles', description: "Set the titles for link columns", icon: Edit2, children: (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField control={form.control} name="topToolsTitle" render={({ field }) => (
              <FormItem><FormLabel>Top Tools Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
           <FormField control={form.control} name="quickLinksTitle" render={({ field }) => (
              <FormItem><FormLabel>Quick Links Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
           <FormField control={form.control} name="moreToolsTitle" render={({ field }) => (
              <FormItem><FormLabel>More Tools Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
           <FormField control={form.control} name="hostingLinksTitle" render={({ field }) => (
              <FormItem><FormLabel>Hosting Links Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
      </div>
    )},
    { id: 'topTools', title: 'Top Tools Links', icon: LinkIcon, children: <LinkArrayEditor control={form.control} name="topTools" /> },
    { id: 'quickLinks', title: 'Quick Links', icon: LinkIcon, children: <LinkArrayEditor control={form.control} name="quickLinks" /> },
    { id: 'moreTools', title: 'More Tools Links', icon: LinkIcon, children: <LinkArrayEditor control={form.control} name="moreTools" /> },
    { id: 'hostingLinks', title: 'Hosting Links', icon: LinkIcon, children: <LinkArrayEditor control={form.control} name="hostingLinks" /> },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Footer Management</h1>
              <p className="text-muted-foreground">
                Customize the content and links in your website's footer.
              </p>
            </div>
             <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(section => (
                <CollapsibleSection
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    isOpen={openSection === section.id}
                    onToggle={handleToggle}
                    isFullWidth={openSection === section.id}
                >
                    {section.children}
                </CollapsibleSection>
            ))}
        </div>
      </form>
    </Form>
  );
}
