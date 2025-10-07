
'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Tool } from '@/ai/flows/tool-management.types';
import type { Review } from '@/ai/flows/review-management.types';
import type { AdvertisementSettings } from '@/ai/flows/settings-management.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/tools/ReviewForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle2, Cpu, DownloadCloud, ListOrdered, Loader2, MousePointerClick, ShieldCheck, Sparkles, Star, Zap, BrainCircuit, Construction } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toolComponents } from '@/components/tools/tool-components';
import { addUserActivity } from '@/ai/flows/user-activity';

const ToolStatusDisplay = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-muted/50 rounded-lg">
        <Icon className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

interface ToolPageClientProps {
  tool: Tool;
  toolReviews: Review[];
  adSettings: AdvertisementSettings | null;
  sidebar: React.ReactNode;
}

export function ToolPageClient({ tool, toolReviews, adSettings, sidebar }: ToolPageClientProps) {
    const { user } = useAuth();
    
    useEffect(() => {
        if (user && tool) {
            addUserActivity(user.uid, 'tool_usage', { name: tool.name, path: `/tools/${tool.slug}` });
        }
    }, [user, tool]);

    const ToolComponent = useMemo(() => {
        if (!tool || !toolComponents[tool.slug]) return null;
        // The component is already a dynamic component from our new tool-components file
        return toolComponents[tool.slug];
    }, [tool]);

    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

    const renderToolContent = () => {
        switch (tool.status) {
            case 'Maintenance':
                return <ToolStatusDisplay icon={Construction} title="Under Maintenance" description="This tool is currently undergoing maintenance to improve its features. Please check back later." />;
            case 'Coming Soon':
                return <ToolStatusDisplay icon={Sparkles} title="Coming Soon!" description="Our team is hard at work on this new tool. It will be available shortly!" />;
            default:
                return ToolComponent ? <ToolComponent /> : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-lg text-muted-foreground">Tool interface coming soon!</p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Button asChild variant="outline" className="mb-6">
                <Link href="/tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Tools
                </Link>
            </Button>
            <AdPlaceholder adSlotId="toolpage-banner-top" adSettings={adSettings} className="mb-6" />
            <div className="flex flex-col lg:flex-row lg:gap-8">
                <div className="flex-1 space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-center gap-4">
                    <Icon className="h-10 w-10 text-primary" />
                    <CardTitle className="text-3xl font-bold">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-muted-foreground mb-6 text-center">{tool.description}</p>
                    <div className="min-h-[300px] rounded-lg bg-muted/50 p-4 sm:p-8">
                        {renderToolContent()}
                    </div>
                    <AdPlaceholder adSlotId="toolpage-in-description" adSettings={adSettings} className="my-6" />
                    </CardContent>
                </Card>
                
                {tool.howToUse && tool.howToUse.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListOrdered /> How to use {tool.name}?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tool.howToUse.map((step, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-1">{index + 1}</div>
                                        <p className="text-muted-foreground">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                <AdPlaceholder adSlotId="toolpage-banner-bottom" adSettings={adSettings} />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 /> Why Choose Our Tools?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="text-primary"/>Secure & Reliable</h3><p className="text-sm text-muted-foreground mt-1">Your data privacy is our priority. All tools run securely, and we never store your input data.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><Zap className="text-primary"/>Blazing Fast</h3><p className="text-sm text-muted-foreground mt-1">Get your results instantly without any unnecessary delays. Our tools are optimized for speed.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><MousePointerClick className="text-primary"/>User-Friendly Interface</h3><p className="text-sm text-muted-foreground mt-1">No complicated setups. Our tools are designed to be intuitive and easy for everyone.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><Cpu className="text-primary"/>AI-Powered</h3><p className="text-sm text-muted-foreground mt-1">Many of our tools leverage cutting-edge AI to provide smarter, more accurate, and creative results.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><DownloadCloud className="text-primary"/>No Installation Needed</h3><p className="text-sm text-muted-foreground mt-1">All our tools run directly in your browser. There is nothing to download or install on your device.</p></Card>
                        <Card className="p-4 bg-background"><h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="text-primary"/>Constantly Evolving</h3><p className="text-sm text-muted-foreground mt-1">We are always adding new tools and improving existing ones based on user feedback and new technology.</p></Card>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Reviews for {tool.name}</CardTitle>
                        <CardDescription>See what other users are saying about this tool.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReviewForm toolId={tool.slug} toolName={tool.name} />
                        <Separator className="my-8" />
                        <div className="space-y-6">
                            {toolReviews.length > 0 ? toolReviews.map(review => (
                                <div key={review.id} className="flex gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.authorAvatar} alt={review.authorName} />
                                            <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{review.authorName}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                        </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center">No reviews for this tool yet. Be the first to leave one!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                </div>
                {sidebar}
            </div>
        </div>
    );
}

    
