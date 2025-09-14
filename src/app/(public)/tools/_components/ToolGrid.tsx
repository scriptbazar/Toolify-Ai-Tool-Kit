
'use client';

import { useState, useEffect } from 'react';
import { ToolCard } from '@/components/tools/ToolCard';
import { UpgradeProDialog } from '@/components/tools/UpgradeProDialog';
import { useAuth } from '@/hooks/use-auth';
import type { Tool } from '@/ai/flows/tool-management.types';
import { toggleFavoriteTool, getFavoriteTools } from '@/ai/flows/user-management';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ToolGrid({ tools }: { tools: Tool[] }) {
  const { user } = useAuth();
  const [favoriteSlugs, setFavoriteSlugs] = useState<Set<string>>(new Set());
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingFavorites(true);
      getFavoriteTools(user.uid)
        .then(favTools => {
          setFavoriteSlugs(new Set(favTools.map(t => t.slug)));
        })
        .finally(() => setLoadingFavorites(false));
    } else {
        setLoadingFavorites(false);
    }
  }, [user]);

  const handleToggleFavorite = async (slug: string) => {
    if (!user) return;
    
    const newFavorites = new Set(favoriteSlugs);
    const isCurrentlyFavorite = newFavorites.has(slug);

    if (isCurrentlyFavorite) {
      newFavorites.delete(slug);
    } else {
      newFavorites.add(slug);
    }
    setFavoriteSlugs(newFavorites);

    const result = await toggleFavoriteTool(user.uid, slug);
    if (!result.success) {
      // Revert if the backend update fails
      const revertedFavorites = new Set(favoriteSlugs);
      if (isCurrentlyFavorite) {
        revertedFavorites.add(slug);
      } else {
        revertedFavorites.delete(slug);
      }
      setFavoriteSlugs(revertedFavorites);
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  if (tools.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No tools found for your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {loadingFavorites 
         ? [...Array(10)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
         : tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favoriteSlugs.has(tool.slug)}
              onToggleFavorite={handleToggleFavorite}
              showUpgradeDialog={() => setIsUpgradeDialogOpen(true)}
            />
          ))}
      </div>
      <UpgradeProDialog isOpen={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen} />
    </>
  );
}
