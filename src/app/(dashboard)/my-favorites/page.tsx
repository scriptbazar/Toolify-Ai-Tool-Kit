
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getTools } from '@/ai/flows/tool-management';
import { ToolGrid } from '@/app/(public)/tools/_components/ToolGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Tool } from '@/ai/flows/tool-management.types';
import { Star } from 'lucide-react';

export default function MyFavoritesPage() {
  const { user, userData } = useAuth();
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && userData) {
      setLoading(true);
      getTools()
        .then(allTools => {
          const userFavorites = allTools.filter(tool => userData.favorites?.includes(tool.slug));
          setFavoriteTools(userFavorites);
        })
        .catch(err => {
          console.error("Failed to load favorite tools:", err);
          toast({
            title: "Error",
            description: "Could not load your favorite tools.",
            variant: "destructive"
          });
        })
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user, userData, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground">
          Your handpicked collection of most-used tools.
        </p>
      </div>
      
      {favoriteTools.length > 0 ? (
        <ToolGrid tools={favoriteTools} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg bg-card">
            <Star className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No Favorites Yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Click the star icon on any tool to add it to your favorites for quick access.
            </p>
        </div>
      )}
    </div>
  );
}
