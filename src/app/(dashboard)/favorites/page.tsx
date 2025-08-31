
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Search } from "lucide-react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTools } from '@/ai/flows/tool-management';
import type { Tool } from '@/ai/flows/tool-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolCard } from '@/components/tools/ToolCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function FavoritesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // As a one-time setup, I'm adding some default favorites for the logged-in user.
  // In a real app, users would add favorites themselves.
  const setupDefaultFavorites = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && !userDoc.data().favorites) {
      await updateDoc(userDocRef, {
        favorites: ['case-converter', 'password-generator', 'pdf-merger']
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          await setupDefaultFavorites(firebaseUser.uid);
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const [allTools, userDocSnap] = await Promise.all([
            getTools(),
            getDoc(userDocRef),
          ]);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const favoriteSlugs: string[] = userData.favorites || [];
            const userFavorites = allTools.filter(tool => favoriteSlugs.includes(tool.slug));
            setFavoriteTools(userFavorites);
          }
        } catch (err: any) {
          console.error("Failed to load favorites:", err);
          setError("Could not load your favorite tools. Please check your permissions or try again later.");
          toast({
            title: "Error Loading Favorites",
            description: "There was a problem fetching your favorite tools.",
            variant: "destructive",
          });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground">
          Your hand-picked collection of most-used tools.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && (
        <>
            {favoriteTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {favoriteTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed rounded-lg">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full p-4">
                           <Heart className="w-12 h-12 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-xl">You have no favorites yet.</CardTitle>
                        <CardDescription className="mt-2">
                            Explore our tools and click the heart icon to add them to your favorites for quick access.
                        </CardDescription>
                    </CardContent>
                </Card>
            )}
        </>
      )}
    </div>
  );
}
