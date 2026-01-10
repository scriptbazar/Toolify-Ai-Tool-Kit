
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { type UserMedia } from '@/ai/flows/user-activity.types';
import Image from 'next/image';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface MyMediaClientProps {
    initialMedia: UserMedia[];
}

export function MyMediaClient({ initialMedia }: MyMediaClientProps) {
    const [media, setMedia] = useState<UserMedia[]>(initialMedia);
    
    // This would be a server action
    const deleteMedia = (id: string) => {
        setMedia(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Media</h1>
                <p className="text-muted-foreground">
                    A gallery of your recent AI-generated images and uploaded media.
                </p>
            </div>
            
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    All media files are automatically deleted after their expiration date to save space.
                </AlertDescription>
            </Alert>

            {media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {media.map((item) => (
                        <Card key={item.id} className="group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-square w-full bg-muted">
                                    <Image src={item.mediaUrl} alt={item.prompt || 'Generated Media'} layout="fill" objectFit="cover" />
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" asChild>
                                            <a href={item.mediaUrl} download={`media-${item.id}.png`}>
                                                <Download className="h-5 w-5"/>
                                            </a>
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => deleteMedia(item.id)}>
                                            <Trash2 className="h-5 w-5"/>
                                        </Button>
                                     </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <p className="text-sm text-muted-foreground truncate">{item.prompt || 'Uploaded Media'}</p>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4"/>
                                        Expires in: <CountdownTimer expiryDate={new Date(item.expiresAt)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <Card className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed bg-card">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">No Media Yet</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Your generated images and other media will appear here.
                    </p>
                </Card>
            )}
        </div>
    );
}

