
import { getPosts } from '@/ai/flows/blog-management';
import { getTools } from '@/ai/flows/tool-management';
import { getSettings } from '@/ai/flows/settings-management';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import * as Icons from 'lucide-react';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const SidebarWidget = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="p-4">
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {children}
        </CardContent>
    </Card>
);

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const allPosts = await getPosts();
  const post = allPosts.find((p) => p.slug === params.slug);
  const settings = await getSettings();

  if (!post) {
    notFound();
  }
  
  const sidebarSettings = settings.sidebar?.blogSidebar;
  const popularTools = (await getTools()).filter(t => t.status === 'Active').slice(0, 5);
  const recentPosts = allPosts.filter(p => p.status === 'Published' && p.id !== post.id).slice(0, 5);


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <AdPlaceholder adSlotId="blog-post-banner-top" adSettings={settings.advertisement ?? null} className="mb-6" />
        <div className="flex flex-col lg:flex-row lg:gap-8">
            <main className="flex-1">
                <article>
                    <header className="mb-8">
                        <div className="mb-4">
                             <Badge>{post.category}</Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            {post.title}
                        </h1>
                        <div className="mt-6 flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Author" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">ToolifyAI Team</p>
                                <p className="text-sm text-muted-foreground">
                                    Published on {new Date(post.publishedAt!).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </header>
                    {post.imageUrl && (
                        <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                                data-ai-hint={post.imageHint || 'blog post image'}
                            />
                        </div>
                    )}
                    <AdPlaceholder adSlotId="blog-post-in-content-start" adSettings={settings.advertisement ?? null} className="mb-6" />
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <AdPlaceholder adSlotId="blog-post-in-content-end" adSettings={settings.advertisement ?? null} className="mt-6" />
                </article>
            </main>
             <aside className="w-full lg:w-64 xl:w-80 mt-8 lg:mt-0 space-y-6">
                <AdPlaceholder adSlotId="blog-post-sidebar" adSettings={settings.advertisement ?? null} />
                {sidebarSettings?.showPopularTools && popularTools.length > 0 && (
                    <SidebarWidget title="Popular Tools">
                        <ul className="space-y-2">
                            {popularTools.map(t => {
                                const ToolIcon = (Icons as any)[t.icon] || Icons.HelpCircle;
                                return (
                                <li key={t.id}>
                                    <Link href={`/tools/${t.slug}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
                                        <ToolIcon className="h-5 w-5" />
                                        <span>{t.name}</span>
                                    </Link>
                                </li>
                            )})}
                        </ul>
                    </SidebarWidget>
                )}
                {sidebarSettings?.showRecentPosts && recentPosts.length > 0 && (
                    <SidebarWidget title="Recent Posts">
                        <ul className="space-y-3">
                            {recentPosts.map(p => (
                                <li key={p.id}>
                                    <Link href={`/blog/${p.slug}`} className="group">
                                        <p className="font-medium text-sm group-hover:text-primary transition-colors leading-tight">{p.title}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(p.publishedAt!).toLocaleDateString()}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </SidebarWidget>
                )}
            </aside>
        </div>
        <AdPlaceholder adSlotId="blog-post-banner-bottom" adSettings={settings.advertisement ?? null} className="mt-6" />
    </div>
  );
}
