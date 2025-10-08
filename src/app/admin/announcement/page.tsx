

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Send, Loader2, Eye } from 'lucide-react';
import { generateAnnouncement, saveAnnouncement } from '@/ai/flows/announcement-flow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const announcementSchema = z.object({
  featureName: z.string().min(3, { message: "Feature name must be at least 3 characters." }),
  featureDescription: z.string().min(10, { message: "Description must be at least 10 characters." }),
  title: z.string().min(10, { message: "Title must be at least 10 characters." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      featureName: '',
      featureDescription: '',
      title: '',
      content: '',
    },
  });

  const handleGenerateContent = async () => {
    const { featureName, featureDescription } = form.getValues();
    if (!featureName || !featureDescription) {
      toast({
        title: "Feature details required",
        description: "Please enter a feature name and description to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAnnouncement({ featureName, featureDescription });
      form.setValue('title', result.title);
      form.setValue('content', result.content);
      toast({
        title: "Content Generated!",
        description: "The announcement title and content have been drafted by AI.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate content.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePublish = async (values: AnnouncementFormValues) => {
    setIsSending(true);
    try {
        const result = await saveAnnouncement(values);
        if (result.success) {
            toast({
                title: "Announcement Published!",
                description: "Your announcement has been saved and will be sent as a notification to users.",
            });
            form.reset();
        } else {
             throw new Error(result.message);
        }
    } catch (error: any) {
        toast({
            title: "Publishing Failed",
            description: error.message || "Could not publish the announcement.",
            variant: "destructive",
        });
    } finally {
        setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Announcement</h1>
        <p className="text-muted-foreground">
          Craft and publish announcements to your users. Use AI to help you write.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePublish)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Generation</CardTitle>
                <CardDescription>
                  Provide some details about the new feature to generate an announcement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="featureName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feature Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AI Image Generation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="featureDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feature Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what the new feature does and its benefits..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                />
                <Button type="button" onClick={handleGenerateContent} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Content
                </Button>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Announcement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Announcement Title</FormLabel>
                        <FormControl>
                          <Input placeholder="🚀 New Feature: Introducing..." {...field} />
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
                        <FormLabel>Announcement Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="The main body of your announcement..."
                            className="min-h-[200px] resize-y"
                            {...field}
                          />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">
                    Review your announcement and publish it to notify all users.
                 </p>
                <div className="flex flex-col gap-2">
                   <Dialog>
                    <DialogTrigger asChild>
                       <Button type="button" variant="outline" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                       <DialogHeader>
                        <DialogTitle>{form.watch('title') || 'Your Title Here'}</DialogTitle>
                         <DialogDesc>
                          This is a preview of how the announcement will look to users.
                        </DialogDesc>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                            {form.watch('content') || 'Your content will appear here...'}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button type="submit" disabled={isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publish Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
