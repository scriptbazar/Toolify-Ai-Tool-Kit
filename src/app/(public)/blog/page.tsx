
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const allPosts = [
    {
        category: 'Productivity',
        title: '10 AI-Powered Tools to Supercharge Your Productivity',
        description: 'Discover how artificial intelligence can help you automate tasks, save time, and focus on what matters most.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'AI productivity',
        href: '#',
    },
    {
        category: 'SEO',
        title: 'The Ultimate Guide to SEO for Beginners in 2024',
        description: 'Learn the fundamentals of Search Engine Optimization and start driving more organic traffic to your website.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'SEO guide',
        href: '#',
    },
    {
        category: 'Design',
        title: '5 Design Principles for Creating Stunning Images',
        description: 'Master the core principles of design to create visually appealing images that captivate your audience.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'design principles',
        href: '#',
    },
    {
        category: 'Development',
        title: 'A Deep Dive into Serverless with Next.js',
        description: 'Explore the benefits and challenges of building serverless applications using Next.js and Vercel.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'serverless code',
        href: '#',
    },
    {
        category: 'AI',
        title: 'The Rise of Large Language Models: What\'s Next?',
        description: 'From GPT-4 to open-source alternatives, we explore the future of language-based artificial intelligence.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'AI brain',
        href: '#',
    },
    {
        category: 'Productivity',
        title: 'How to Stay Focused in a World of Distractions',
        description: 'Practical tips and techniques to help you maintain focus and achieve your goals in a busy world.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'focused work',
        href: '#',
    },
    {
        category: 'Marketing',
        title: 'Content Marketing Strategies for 2024',
        description: 'Learn how to create and distribute valuable content to attract and retain a clearly defined audience.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'marketing strategy',
        href: '#',
    },
    {
        category: 'Design',
        title: 'UI vs. UX: A Comprehensive Guide for Beginners',
        description: 'Understand the key differences between UI and UX design and why both are crucial for a successful product.',
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'UI UX design',
        href: '#',
    },
];

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

    const paginatedPosts = allPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
             <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                From Our Blog
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Stay updated with the latest news, tips, and tutorials from our team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post, index) => (
                    <BlogPostCard
                        key={index}
                        category={post.category}
                        title={post.title}
                        description={post.description}
                        imageUrl={post.imageUrl}
                        imageHint={post.imageHint}
                        href={post.href}
                    />
                ))}
            </div>

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
