
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

// Dummy data for demonstration purposes
const aiGeneratedMedia = [
    { id: 1, src: "https://picsum.photos/400/300", alt: "AI generated landscape", hint: "landscape" },
    { id: 2, src: "https://picsum.photos/400/300", alt: "AI generated portrait", hint: "portrait" },
    { id: 3, src: "https://picsum.photos/400/300", alt: "AI generated abstract art", hint: "abstract art" },
];

const communityMedia = [
    { id: 1, src: "https://picsum.photos/400/300", alt: "Community shared photo", hint: "community photo" },
];

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
                {aiGeneratedMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {aiGeneratedMedia.map(media => <MediaCard key={media.id} {...media} />)}
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
                {communityMedia.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {communityMedia.map(media => <MediaCard key={media.id} {...media} />)}
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
