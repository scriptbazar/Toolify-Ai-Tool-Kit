
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPosts, type Post } from '@/ai/flows/blog-management';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPosts().then(allPosts => {
            const publishedPosts = allPosts.filter(p => p.status === 'Published');
            setPosts(publishedPosts);
            setLoading(false);
        });
    }, []);

    const currentPage = Number(searchParams.get('page') || 1);
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    const paginatedPosts = posts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    if (loading) {
        return <div className="container mx-auto px-4 py-12 md:py-20">Loading posts...</div>
    }

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

            {paginatedPosts.length > 0 ? (
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
                        asChild
                        disabled={currentPage === 1}
                    >
                      <Link href={`/blog?page=${currentPage - 1}`} scroll={false}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        asChild
                        disabled={currentPage === totalPages}
                    >
                      <Link href={`/blog?page=${currentPage + 1}`} scroll={false}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
