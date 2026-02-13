'use client';

import { forwardRef, type MouseEvent } from 'react';
import Link from 'next/link';
import type { Tool } from '@/ai/flows/tool-management.types';
import * as Icons from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toolCategories } from '@/lib/constants';

type ToolCardProps = {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  showUpgradeDialog: () => void;
};

const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
        case 'Maintenance':
            return <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm z-10">Maintenance</Badge>;
        case 'Coming Soon':
            return <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm z-10">Coming Soon</Badge>;
        case 'New Version':
            return <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white shadow-sm z-10">New Version</Badge>;
        case 'Beta':
            return <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white shadow-sm z-10">Beta</Badge>;
        default:
            return null;
    }
}

export function ToolCard({ tool, isFavorite, onToggleFavorite, showUpgradeDialog }: ToolCardProps) {
  const { name, description, slug, status, plan, category } = tool;
  const { user } = useAuth();
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  const statusBadge = getStatusBadge(status);
  const { toast } = useToast();
  const router = useRouter();

  const categoryInfo = toolCategories.find(c => c.id === category);
  const iconColors = categoryInfo?.color || { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', glow: '' };

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
      if (!user) {
          e.preventDefault();
          router.push(`/login?redirectUrl=/tools/${slug}`);
          return;
      }
      if (plan === 'Pro' && !isProUser) {
          e.preventDefault();
          showUpgradeDialog();
      }
  }

  const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <div ref={ref} {...props} className={cn(
        "relative group h-full w-full",
        !isClickable && "cursor-not-allowed opacity-60"
      )}>
      <div className={cn(
        "relative flex h-full flex-col items-center justify-start rounded-xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1",
        "border-2",
        iconColors.border,
        "hover:shadow-xl",
        iconColors.glow
      )}>
        {statusBadge ? statusBadge : (
            <>
              {tool.isNew && <Badge variant="outline" className="absolute top-2 left-2 border-primary text-primary bg-background/80 shadow-sm z-10">New</Badge>}
            </>
        )}
        <Button
            variant="ghost"
            size="icon"
            className={cn("absolute top-1 right-1 h-8 w-8 rounded-full transition-opacity z-20", user ? "opacity-20 group-hover:opacity-100" : "opacity-0")}
            onClick={handleFavoriteClick}
            aria-label="Toggle favorite"
            >
            <Icons.Star className={cn("h-5 w-5", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </Button>
        {plan === 'Pro' && (
            <div className="absolute bottom-3 right-3 z-10">
                <Badge className="shadow-sm font-bold bg-primary text-primary-foreground">Pro</Badge>
            </div>
        )}
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-all group-hover:scale-110 shadow-md", iconColors.bg)}>
          <Icon className={cn("h-8 w-8 transition-transform", iconColors.text)} />
        </div>
        <div className="flex-grow w-full">
            <h3 className="text-base font-extrabold mb-3 group-hover:text-primary transition-colors leading-tight">{name}</h3>
            <div className="h-16 overflow-hidden">
                <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
      </div>
    </div>
  ));
  CardContent.displayName = 'CardContent';

  if (isClickable) {
      return (
        <Link href={`/tools/${slug}`} passHref className="h-full">
          <CardContent onClick={handleCardClick} />
        </Link>
      );
  }

  return <CardContent />;
}
