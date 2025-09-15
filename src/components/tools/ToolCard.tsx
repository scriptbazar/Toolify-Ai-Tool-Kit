
'use client';

import { useState, useEffect, forwardRef, type MouseEvent } from 'react';
import Link from 'next/link';
import type { Tool } from '@/ai/flows/tool-management.types';
import * as Icons from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type ToolCardProps = {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  showUpgradeDialog: () => void;
};

const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
        case 'Maintenance':
            return <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow">Maintenance</Badge>;
        case 'Coming Soon':
            return <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white shadow">Coming Soon</Badge>;
        case 'New Version':
            return <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white shadow">New Version</Badge>;
        case 'Beta':
            return <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white shadow">Beta</Badge>;
        default:
            return null;
    }
}

export function ToolCard({ tool, isFavorite, onToggleFavorite, showUpgradeDialog }: ToolCardProps) {
  const { name, description, slug, status, plan } = tool;
  const { user } = useAuth();
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  const statusBadge = getStatusBadge(status);
  const { toast } = useToast();

  const isClickable = status === 'Active' || status === 'New Version' || status === 'Beta';
  
  const isProUser = user?.role === 'admin' || user?.planId === 'pro' || user?.planId === 'team';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to add favorites.", variant: "destructive" });
        return;
    }
    onToggleFavorite(slug);
  };
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (plan === 'Pro' && !isProUser) {
          e.preventDefault();
          showUpgradeDialog();
      }
  }

  const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <div ref={ref} {...props} className={cn(
        "relative group h-full w-full",
        !isClickable && "cursor-not-allowed"
      )}>
      <div className={cn(
        "relative flex h-full flex-col items-center justify-start rounded-lg border bg-card p-6 text-center transition-all duration-300 group-hover:-translate-y-1",
        !isClickable && "opacity-70"
      )}>
        {statusBadge ? statusBadge : (
            <>
              {tool.isNew && <Badge variant="outline" className="absolute top-2 left-2 border-primary text-primary bg-background/80 shadow">New</Badge>}
            </>
        )}
        <Button
            variant="ghost"
            size="icon"
            className={cn("absolute top-1 right-1 h-8 w-8 rounded-full transition-opacity", user ? "opacity-20 group-hover:opacity-100" : "opacity-0")}
            onClick={handleFavoriteClick}
            aria-label="Toggle favorite"
            >
            <Icons.Star className={cn("h-5 w-5", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </Button>
        {plan === 'Pro' && (
            <div className="absolute bottom-3 right-3">
                <Badge className="shadow-md">Pro</Badge>
            </div>
        )}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 transition-colors group-hover:bg-primary/20">
          <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
        </div>
        <div className="flex-grow">
            <h3 className="text-sm font-semibold mb-1">{name}</h3>
            <p className="text-xs text-muted-foreground h-16 overflow-hidden">
                {description}
            </p>
        </div>
      </div>
    </div>
  ));
  CardContent.displayName = 'CardContent';

  if (isClickable) {
      return (
        <Link href={`/tools/${slug}`} passHref>
          <CardContent onClick={handleCardClick} />
        </Link>
      );
  }

  return <CardContent />;
}
