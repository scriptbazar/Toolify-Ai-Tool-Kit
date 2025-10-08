

'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Image as ImageIcon, AlertCircle, Ticket, Clock, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';


// Define the type based on expected Firestore structure
type UserMedia = {
  id: string;
  userId: string;
  type: 'ai-generated' | 'community-chat' | 'ticket-media';
  mediaUrl: string;
  prompt?: string;
  createdAt: string; // Assuming to be an ISO string
  expiresAt: string; // Assuming to be an ISO string
};

const getUserMedia = async (userId: string): Promise<UserMedia[]> => {
    const mediaCollection = collection(db, 'userMedia');
    const q = query(mediaCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const mediaList: UserMedia[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        mediaList.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
            expiresAt: (data.expiresAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
        } as UserMedia);
    });
    return mediaList;
};



const MediaCard = ({ media }: { media: UserMedia }) => {
    const expiryDate = new Date(media.expiresAt);
    const creationDate = new Date(media.createdAt);

    return (
        <Card className="overflow-hidden flex flex-col">
            <div className="aspect-video relative">
                 <Image
                    src={media.mediaUrl}
                    alt={media.prompt || 'User media'}
                    fill
                    data-ai-hint={media.prompt || 'user media'}
                    className="object-cover"
                />
            </div>
            <CardContent className="p-3 bg-muted/50 text-xs flex-grow flex flex-col justify-end">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {creationDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                     <CountdownTimer
                        expiryDate={expiryDate}
                        expiredText="Expired & Deleted"
                        expiredClassName="text-red-500 font-bold"
                     >
                        {(timeLeft) => (
                            <span>
                                Deletes in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                            </span>
                        )}
                     </CountdownTimer>
                </div>
            </CardContent>
        </Card>
    );
};


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
  
  const communityMedia = media.filter(m => m.type === 'community-chat');
  const ticketMedia = media.filter(m => m.type === 'ticket-media');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Media</h1>
        <p className="text-muted-foreground">
          View all the media you've generated or shared with the community.
        </p>
      </div>

      <Tabs defaultValue="community" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="community"><MessageSquare className="mr-2 h-4 w-4"/>Community Chat</TabsTrigger>
          <TabsTrigger value="ticket"><Ticket className="mr-2 h-4 w-4"/>Ticket Media</TabsTrigger>
        </TabsList>
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
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                ) : communityMedia.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {communityMedia.map(item => <MediaCard key={item.id} media={item} />)}
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
        <TabsContent value="ticket" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Media</CardTitle>
              <CardDescription>Files you've attached to your support tickets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Heads Up!</AlertTitle>
                    <AlertDescription>
                      Media attached to support tickets is deleted along with the ticket, which is 15 days after creation.
                    </AlertDescription>
                </Alert>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                ) : ticketMedia.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ticketMedia.map(item => <MediaCard key={item.id} media={item} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">You haven't attached any media to tickets.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
