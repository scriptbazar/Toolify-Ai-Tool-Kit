
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import type { Tool } from '@/ai/flows/tool-management.types';
import * as Icons from 'lucide-react';

export function ToolOfTheWeek({ tool }: { tool: Tool }) {
    const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

    return (
        <Card className="bg-primary/10 border-primary border-2 shadow-lg">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-2">
                    <Star className="w-5 h-5"/>
                    <span>Tool of the Week</span>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col items-center">
                <div className="flex items-center justify-center h-24 w-24 mb-6 rounded-full bg-background/50 border shadow-inner">
                    <Icon className="h-12 w-12 text-primary"/>
                </div>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                    {tool.description}
                </p>
                <Button asChild size="lg">
                    <Link href={`/tools/${tool.slug}`}>
                        Try it Now <ArrowRight className="ml-2 h-5 w-5"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
