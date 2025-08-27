'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAllPromptTemplates, savePromptTemplate, type AiPromptTemplateOutput } from '@/ai/flows/ai-prompt-templates';
import { tools } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required.'),
});

const defaultTemplates = tools
  .filter(tool => tool.category === 'ai' || tool.category === 'dev' || tool.category === 'pdf')
  .map(tool => ({
    name: `${tool.slug}Prompt`,
    description: `Default prompt for ${tool.name}.`,
    content: `You are an expert ${tool.name}. Your task is to...`,
  }));

export default function PromptTemplateManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AiPromptTemplateOutput[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AiPromptTemplateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      content: '',
    },
  });

  const loadInitialTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      // First, get all templates that already exist in Firestore.
      let existingTemplates = await getAllPromptTemplates();
      
      // Determine which default templates are missing from Firestore.
      const missingTemplates = defaultTemplates.filter(
        defaultT => !existingTemplates.some(existingT => existingT.name === defaultT.name)
      );

      // If there are missing templates, save them to Firestore.
      if (missingTemplates.length > 0) {
        await Promise.all(missingTemplates.map(t => savePromptTemplate(t)));
        // Reload all templates to get a fresh list including the new ones.
        existingTemplates = await getAllPromptTemplates();
      }
      
      setTemplates(existingTemplates);

      if (existingTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(existingTemplates[0]);
      }

    } catch (error) {
      console.error('Failed to load or create templates:', error);
      toast({
        title: 'Error',
        description: 'Could not load prompt templates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedTemplate]);


  useEffect(() => {
    loadInitialTemplates();
  }, [loadInitialTemplates]);

  useEffect(() => {
    if (selectedTemplate) {
      form.reset(selectedTemplate);
    } else {
      form.reset({ name: '', description: '', content: '' });
    }
  }, [selectedTemplate, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const saved = await savePromptTemplate(values);
      toast({
        title: 'Success!',
        description: `Template "${saved.name}" has been saved.`,
      });
      // Refresh the list from the source of truth
      const allTemplates = await getAllPromptTemplates();
      setTemplates(allTemplates);
      setSelectedTemplate(saved);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: 'Could not save the template.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Select a template to edit or create a new one.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading templates...</p>
            ) : (
              templates.map(template => (
                <Button
                  key={template.name}
                  variant={selectedTemplate?.name === template.name ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {template.name}
                </Button>
              ))
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedTemplate(null)}
            >
              + Create New Template
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <CardDescription>
              {selectedTemplate
                ? `Editing the "${selectedTemplate.name}" template.`
                : 'Define a new prompt template for an AI tool.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., aiWriterPrompt"
                          {...field}
                          disabled={!!selectedTemplate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A short description of what this prompt does" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="You are an expert..."
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Template'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
