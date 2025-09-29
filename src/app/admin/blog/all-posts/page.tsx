

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getPosts } from '@/ai/flows/blog-management';
import { AllPostsClient } from './_components/AllPostsClient';

export default async function AllPostsPage() {
  const allPosts = await getPosts('all');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
        <p className="text-muted-foreground">
          View, edit, and manage all your blog posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>All Blog Posts</CardTitle>
                <CardDescription>
                    View, edit, and manage all your blog posts.
                </CardDescription>
            </div>
            <Button asChild>
                <Link href="/admin/blog/add-new"><PlusCircle className="mr-2 h-4 w-4"/>Add New Post</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <AllPostsClient initialPosts={allPosts} />
        </CardContent>
      </Card>
    </div>
  );
}
