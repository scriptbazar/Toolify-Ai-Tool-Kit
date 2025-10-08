


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
import { PlusCircle, Trash2, Edit, MoreHorizontal, Loader2, Save } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPosts } from '@/ai/flows/blog-management';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/ai/flows/blog-management';
import type { Post } from '@/ai/flows/blog-management.types';
import type { Category } from '@/ai/flows/blog-management.types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
 import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';


interface CategoryWithCount extends Category {
    count: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();
    
    const fetchCategoriesAndPosts = async () => {
        setLoading(true);
        try {
            const [fetchedCategories, fetchedPosts] = await Promise.all([
                getCategories(),
                getPosts(),
            ]);
            
            const categoryCounts = fetchedPosts.reduce((acc, post) => {
                acc[post.category] = (acc[post.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const categoriesWithCounts = fetchedCategories.map(cat => ({
                ...cat,
                count: categoryCounts[cat.name] || 0,
            }));
            
            setCategories(categoriesWithCounts);
            setPosts(fetchedPosts);

        } catch (error) {
             toast({ title: 'Error', description: 'Could not load data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoriesAndPosts();
    }, []);


    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name) {
            toast({ title: 'Name is required', variant: 'destructive'});
            return;
        }
        setIsAdding(true);
        const result = await addCategory(newCategory);
        if (result.success) {
            toast({ title: 'Category added!' });
            setNewCategory({ name: '', slug: '', description: '' });
            fetchCategoriesAndPosts(); // Refresh list
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsAdding(false);
    };

    const handleUpdateCategory = async () => {
        if (!isEditing) return;
        
        const result = await updateCategory(isEditing.id, { name: isEditing.name, slug: isEditing.slug, description: isEditing.description });
        if (result.success) {
            toast({ title: 'Category updated!' });
            setIsEditing(null);
            fetchCategoriesAndPosts();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        setIsDeleting(categoryId);
        const result = await deleteCategory(categoryId);
        if (result.success) {
            toast({ title: 'Category deleted!' });
            fetchCategoriesAndPosts();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive'});
        }
        setIsDeleting(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const slug = name === 'name' ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : newCategory.slug;
        setNewCategory(prev => ({ ...prev, [name]: value, slug }));
    };
    
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isEditing) return;
        const { name, value } = e.target;
        const slug = name === 'name' ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : isEditing.slug;
        setIsEditing(prev => prev ? { ...prev, [name]: value, slug } : null);
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
                            disabled
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
                    <Button type="submit" className="w-full" disabled={isAdding}>
                        {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
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
                             {loading && [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
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
                                                    <Button size="icon" variant="ghost" disabled={isDeleting === cat.id}>
                                                        {isDeleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setIsEditing(cat)}>
                                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the category. Posts in this category will not be deleted.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>
                                                                    Continue
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
      
       <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                    Update the details for the "{isEditing?.name}" category.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" name="name" value={isEditing?.name || ''} onChange={handleEditInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="edit-slug">Slug</Label>
                    <Input id="edit-slug" name="slug" value={isEditing?.slug || ''} onChange={handleEditInputChange} disabled/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" name="description" value={isEditing?.description || ''} onChange={handleEditInputChange} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleUpdateCategory}><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

