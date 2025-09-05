

'use client';

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { aiWriter } from '@/ai/flows/ai-writer';
import { upsertPost } from '@/ai/flows/blog-management';
import { Wand2, Send, Loader2, Save, ArrowLeft, Target, Heading, Bold, Italic, List, ListOrdered, ArrowDownLeft, ArrowUpRight, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Youtube, Link as LinkIcon, Image as ImageIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const postSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),
  slug: z.string().min(5, { message: 'Slug must be at least 5 characters long.' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters long.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  tags: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  imageHint: z.string().optional(),
  status: z.enum(['Published', 'Draft', 'Scheduled', 'Trash']),
  publishedAt: z.string().datetime().optional(),
  metaDescription: z.string().optional(),
  targetKeyword: z.string().optional(),
  seoTitle: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function AddNewPostPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      category: '',
      tags: '',
      imageUrl: '',
      imageHint: '',
      status: 'Draft',
      publishedAt: undefined,
      metaDescription: '',
      targetKeyword: '',
      seoTitle: '',
      canonicalUrl: '',
    },
  });

  const imageUrlValue = form.watch('imageUrl');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title, { shouldValidate: true });
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    form.setValue('slug', slug, { shouldValidate: true });
  };
  
  const handleWrapTag = (tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'pre' | 'b' | 'i') => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = form.getValues('content');
    const selectedText = currentText.substring(start, end);
    
    const newText = `${currentText.substring(0, start)}<${tag}>${selectedText}</${tag}>${currentText.substring(end)}`;
    
    form.setValue('content', newText, { shouldValidate: true });
    textarea.focus();
  };

  const handleAddList = (type: 'ul' | 'ol') => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = form.getValues('content');
    const selectedText = currentText.substring(start, end);

    let listHtml;
    if (selectedText) {
        const listItems = selectedText.split('\n').map(line => `  <li>${line}</li>`).join('\n');
        listHtml = `<${type}>\n${listItems}\n</${type}>`;
    } else {
        listHtml = `<${type}>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</${type}>`;
    }
    
    const newText = `${currentText.substring(0, start)}${listHtml}${currentText.substring(end)}`;
    form.setValue('content', newText, { shouldValidate: true });
    textarea.focus();
  };
  
  const handleColorChange = (color: string) => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = form.getValues('content');
    const selectedText = currentText.substring(start, end);

    if (selectedText) {
      const newText = `${currentText.substring(0, start)}<span style="color: ${color};">${selectedText}</span>${currentText.substring(end)}`;
      form.setValue('content', newText, { shouldValidate: true });
    } else {
      toast({
        title: "No text selected",
        description: "Please select the text you want to color.",
        variant: "destructive"
      });
    }
    textarea.focus();
  };

  const handleEmbedYouTube = () => {
    const url = window.prompt("Enter the YouTube video URL:");
    if (!url) return;

    let videoId = '';
    const urlParts = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    videoId = (urlParts[2] !== undefined) ? urlParts[2].split(/[^0-9a-z_\-]/i)[0] : urlParts[0];

    if (videoId) {
      const textarea = contentTextAreaRef.current;
      if (!textarea) return;

      const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      
      const start = textarea.selectionStart;
      const currentText = form.getValues('content');
      const newText = `${currentText.substring(0, start)}\n${embedCode}\n${currentText.substring(start)}`;
      
      form.setValue('content', newText, { shouldValidate: true });
      textarea.focus();
    } else {
      toast({
        title: "Invalid YouTube URL",
        description: "Could not extract the video ID. Please check the URL and try again.",
        variant: "destructive"
      });
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt("Enter the image URL:");
    if (!url) return;

    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const altText = window.prompt("Enter alternative text for the image:", "Image");

    const embedCode = `<img src="${url}" alt="${altText || 'Image'}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`;
    
    const start = textarea.selectionStart;
    const currentText = form.getValues('content');
    const newText = `${currentText.substring(0, start)}\n${embedCode}\n${currentText.substring(start)}`;
    
    form.setValue('content', newText, { shouldValidate: true });
    textarea.focus();
  };


  const handleGenerateContent = async () => {
    const title = form.getValues('title');
    if (!title) {
      toast({
        title: 'Title is required',
        description: 'Please enter a title to generate content.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await aiWriter({ topic: title });
      form.setValue('content', result.content);
      toast({
        title: 'Content Generated!',
        description: 'The post content has been successfully generated by AI.',
      });
    } catch (error: any) {
      console.error('AI generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const processAndSavePost = async (values: PostFormValues) => {
    setIsSaving(true);
    try {
      const postData = {
          ...values,
          tags: values.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
      };

      const result = await upsertPost(postData);

      if (result.success) {
         toast({
          title: `Post ${values.status}!`,
          description: `Your post "${values.title}" has been successfully saved.`,
        });
        router.push('/admin/blog/all-posts');
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Could not save the post.', variant: 'destructive'});
    } finally {
      setIsSaving(false);
    }
  }

  const handlePostSubmit = (status: PostFormValues['status']) => {
    form.setValue('status', status);
    form.handleSubmit(processAndSavePost)();
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form>
          <div className="flex items-center justify-between mb-6">
             <div>
                <Link href="/admin/blog/all-posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back To All Posts
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Add New Post</h1>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handlePostSubmit('Draft')} disabled={isSaving}>
                   <Save className="mr-2 h-4 w-4" />
                   Save Draft
                </Button>
                 <Button type="button" variant="secondary" onClick={() => handlePostSubmit('Scheduled')} disabled={isSaving}>
                   <Clock className="mr-2 h-4 w-4" />
                   Schedule
                </Button>
                <Button type="button" onClick={() => handlePostSubmit('Published')} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                  Publish
                </Button>
              </div>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Post Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., The Future of AI" {...field} onChange={handleTitleChange} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Post Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., the-future-of-ai" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="ai">Artificial Intelligence</SelectItem>
                                        <SelectItem value="productivity">Productivity</SelectItem>
                                        <SelectItem value="news">News</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                    <Input placeholder="AI, SaaS, Tech..." {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">Separate with commas.</p>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Featured Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="imageHint"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image Hint</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'blue robot'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-full sm:w-24 h-24 bg-muted rounded-lg flex items-center justify-center border">
                            {imageUrlValue ? (
                                <Image src={imageUrlValue} alt="Image Preview" width={96} height={96} className="object-cover rounded-md" onError={(e) => e.currentTarget.style.display='none'} />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Post Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Post Body</FormLabel>
                                <div className="p-2 border rounded-md bg-muted flex items-center flex-wrap gap-2">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button type="button" variant="outline" size="icon" title="Headings">
                                                <Heading className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleWrapTag('p')}>Paragraph</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h1')}>Heading 1</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h2')}>Heading 2</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h3')}>Heading 3</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h4')}>Heading 4</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h5')}>Heading 5</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('h6')}>Heading 6</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleWrapTag('pre')}>Preformatted</DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                     <Button type="button" variant="outline" size="icon" onClick={() => handleWrapTag('b')} title="Bold"><Bold className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" onClick={() => handleWrapTag('i')} title="Italic"><Italic className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" onClick={() => handleAddList('ul')} title="Bulleted List"><List className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" onClick={() => handleAddList('ol')} title="Numbered List"><ListOrdered className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Inbound Links"><ArrowDownLeft className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Outbound Links"><ArrowUpRight className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Insert Image" onClick={handleInsertImage}><ImageIcon className="h-4 w-4" /></Button>
                                     <Button type="button" variant="outline" size="icon" title="Align Left"><AlignLeft className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Align Center"><AlignCenter className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Align Right"><AlignRight className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Align Justify"><AlignJustify className="h-4 w-4"/></Button>
                                     <Button type="button" variant="outline" size="icon" title="Embed YouTube" onClick={handleEmbedYouTube}><Youtube className="h-4 w-4" /></Button>
                                     <div className="relative">
                                         <Button type="button" variant="outline" size="icon" title="Text Color" onClick={() => colorInputRef.current?.click()}>
                                            <Palette className="h-4 w-4"/>
                                         </Button>
                                         <input
                                            ref={colorInputRef}
                                            type="color"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleColorChange(e.target.value)}
                                          />
                                     </div>
                                    <div className="ml-auto">
                                        <Button 
                                            type="button" 
                                            onClick={handleGenerateContent} 
                                            disabled={isGenerating}
                                            variant="outline"
                                            size="sm"
                                            title="Generate with AI"
                                            >
                                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                                <FormControl>
                                    <Textarea
                                        ref={contentTextAreaRef}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Write your amazing blog post here, or generate it with AI..."
                                        className="min-h-[400px] mt-2"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Optimize your post for search engines.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="seoTitle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>SEO Title</FormLabel>
                                <FormControl><Input {...field} placeholder="A catchy, keyword-rich title for search results." /></FormControl>
                                <p className="text-xs text-muted-foreground">If empty, the main post title will be used.</p>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Meta Description</FormLabel>
                                <FormControl><Textarea {...field} placeholder="A short, compelling description for search results (max 160 characters)." maxLength={160} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="targetKeyword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4"/> Target Keyword</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., 'best ai tools'" /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="canonicalUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Canonical URL</FormLabel>
                                    <FormControl><Input {...field} type="url" placeholder="https://example.com/original-post" /></FormControl>
                                     <p className="text-xs text-muted-foreground">The original source of this content, if it exists elsewhere.</p>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
