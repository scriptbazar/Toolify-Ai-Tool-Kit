
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Edit, MoreHorizontal, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPosts, type Post } from '@/ai/flows/blog-management';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
    name: string;
    slug: string;
    description: string;
    count: number;
}

const definedCategories = [
    { name: 'Technology', slug: 'technology', description: 'All about the latest in tech.' },
    { name: 'Artificial Intelligence', slug: 'ai', description: 'News and articles about AI.' },
    { name: 'Productivity', slug: 'productivity', description: 'Hacks and tips to boost your productivity.' },
    { name: 'News', slug: 'news', description: 'Latest news from the industry.' },
];


export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
    const { toast } = useToast();

    useEffect(() => {
      async function fetchCategoryCounts() {
        setLoading(true);
        try {
          const posts = await getPosts();
          const categoryCounts = posts.reduce((acc, post) => {
            if (post.category) {
              acc[post.category] = (acc[post.category] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          const categoriesWithCounts = definedCategories.map(cat => ({
            ...cat,
            count: categoryCounts[cat.slug] || 0
          }));

          setCategories(categoriesWithCounts);

        } catch (error) {
            toast({ title: 'Error', description: 'Could not load post counts for categories.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
      }
      fetchCategoryCounts();
    }, [toast]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would add logic to save to a database.
        // For now, we just add it to the local state.
        setCategories([...categories, { ...newCategory, count: 0 }]);
        setNewCategory({ name: '', slug: '', description: '' }); // Reset form
        toast({ title: "Category Added", description: "This is for UI demonstration only." });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
             setNewCategory(prev => ({
                ...prev,
                name: value,
                slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
            }));
        } else {
             setNewCategory(prev => ({ ...prev, [name]: value }));
        }
    };


  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog Categories</h1>
        <p className="text-muted-foreground">
          Manage the categories for your blog posts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                        <Label htmlFor="category-name">Name</Label>
                        <Input 
                            id="category-name" 
                            name="name"
                            value={newCategory.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Technology" 
                            required
                        />
                         <p className="text-xs text-muted-foreground mt-1">The name is how it appears on your site.</p>
                    </div>
                    <div>
                        <Label htmlFor="category-slug">Slug</Label>
                        <Input 
                            id="category-slug" 
                            name="slug"
                            value={newCategory.slug}
                            onChange={handleInputChange}
                            placeholder="e.g., technology" 
                        />
                         <p className="text-xs text-muted-foreground mt-1">The "slug" is the URL-friendly version of the name.</p>
                    </div>
                    <div>
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea 
                            id="category-description" 
                            name="description"
                            value={newCategory.description}
                            onChange={handleInputChange}
                            placeholder="A short description of the category." 
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Category
                    </Button>
                </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Existing Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && [...Array(4)].map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ))}
                             {!loading && categories.length > 0 ? (
                                categories.map(cat => (
                                    <TableRow key={cat.slug}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{cat.description || '—'}</TableCell>
                                        <TableCell className="text-right">{cat.count}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
