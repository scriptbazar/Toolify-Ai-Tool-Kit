
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPosts } from '@/ai/flows/blog-management';
import { type Post } from '@/ai/flows/blog-management.types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            try {
                const posts = await getPosts();
                const publishedPosts = posts.filter(p => p.status === 'Published');
                setAllPosts(publishedPosts);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
                toast({ title: 'Error', description: 'Could not load blog posts.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, [toast]);

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

    const paginatedPosts = allPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
             <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Toolify AI Blog
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Stay updated with the latest news, tips, and tutorials from our team.
              </p>
            </div>

            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                 </div>
            ) : paginatedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedPosts.map((post) => (
                        <BlogPostCard
                            key={post.id}
                            category={post.category}
                            title={post.title}
                            description={post.content.substring(0, 100) + '...'}
                            imageUrl={post.imageUrl || 'https://picsum.photos/600/400'}
                            imageHint={post.imageHint || 'blog post'}
                            href={`/blog/${post.slug}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg">No blog posts found.</p>
                </div>
            )}


            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-12">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
