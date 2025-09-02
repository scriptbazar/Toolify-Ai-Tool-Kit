
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { getUserMedia, type UserMedia } from '@/ai/flows/ai-image-generator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const MediaCard = ({ src, alt, hint }: { src: string, alt: string, hint: string }) => (
    <Card className="overflow-hidden">
        <div className="aspect-w-16 aspect-h-9">
             <Image
                src={src}
                alt={alt}
                width={400}
                height={300}
                data-ai-hint={hint}
                className="object-cover w-full h-full"
            />
        </div>
    </Card>
);

export default function MyMediaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [media, setMedia] = useState<UserMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            fetchMedia(firebaseUser.uid);
        } else {
            setLoading(false);
        }
    });

    const fetchMedia = async (uid: string) => {
        setLoading(true);
        try {
            const userMedia = await getUserMedia(uid);
            setMedia(userMedia);
        } catch (error) {
            console.error("Failed to fetch media:", error);
            toast({
                title: "Error",
                description: "Could not load your media.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    return () => unsubscribe();
  }, [toast]);
  
  const aiGeneratedMedia = media.filter(m => m.type === 'ai-generated');
  const communityMedia = media.filter(m => m.type === 'community-chat');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Media</h1>
        <p className="text-muted-foreground">
          View all the media you've generated with AI or shared with the community.
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai"><Bot className="mr-2 h-4 w-4"/>AI Generated Media</TabsTrigger>
          <TabsTrigger value="community"><MessageSquare className="mr-2 h-4 w-4"/>Community Chat Media</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Generated Media</CardTitle>
              <CardDescription>Images you've created using our AI image generator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads Up!</AlertTitle>
                  <AlertDescription>
                    For your privacy and to manage storage, AI-generated images are automatically deleted after 7 days.
                  </AlertDescription>
                </Alert>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                ) : aiGeneratedMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {aiGeneratedMedia.map(item => <MediaCard key={item.id} src={item.mediaUrl} alt={item.prompt || 'AI generated image'} hint={item.prompt || 'ai image'} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">You haven't generated any images yet.</p>
                        <p className="text-sm text-muted-foreground">Try our AI Image Generator to create something amazing!</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="community" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Chat Media</CardTitle>
              <CardDescription>Files and images you've shared in the community chat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Heads Up!</AlertTitle>
                    <AlertDescription>
                      For your privacy and to manage storage, media shared in the community chat is automatically deleted after 48 hours.
                    </AlertDescription>
                </Alert>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                ) : communityMedia.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {communityMedia.map(item => <MediaCard key={item.id} src={item.mediaUrl} alt={item.prompt || 'Community shared media'} hint={item.prompt || 'community media'} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">You haven't shared any media in the chat.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
