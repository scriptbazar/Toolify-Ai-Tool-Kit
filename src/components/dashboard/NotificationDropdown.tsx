
'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { markAnnouncementsAsRead } from '@/ai/flows/announcement-flow';
import type { Announcement } from '@/ai/flows/announcement-flow.types';
import Link from 'next/link';

interface NotificationDropdownProps {
    userId: string;
    initialAnnouncements: Announcement[];
    onAnnouncementsRead: (readAnnouncements: Announcement[]) => void;
}

export function NotificationDropdown({ userId, initialAnnouncements, onAnnouncementsRead }: NotificationDropdownProps) {
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        setHasNew(initialAnnouncements.some(a => a.isNew));
    }, [initialAnnouncements]);

    const handleOpenChange = async (open: boolean) => {
        if (open && hasNew) {
            const newIds = initialAnnouncements.filter(a => a.isNew).map(a => a.id);
            const result = await markAnnouncementsAsRead(userId, newIds);
            if (result.success) {
                // Update parent component state
                const updatedAnnouncements = initialAnnouncements.map(a => ({ ...a, isNew: false }));
                onAnnouncementsRead(updatedAnnouncements);
                setHasNew(false);
            }
        }
    };
    
  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {hasNew && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
            {initialAnnouncements.length > 0 ? (
                initialAnnouncements.map(announcement => (
                    <DropdownMenuItem key={announcement.id} asChild>
                         <Link href={announcement.featureSlug ? `/tools/${announcement.featureSlug}` : '#'} className="flex flex-col items-start gap-2 rounded-lg p-3 text-sm transition-colors hover:bg-accent cursor-pointer">
                            <div className="flex w-full items-start justify-between">
                                <p className="font-semibold">{announcement.title}</p>
                                {announcement.isNew && <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{announcement.content.substring(0, 100)}...</p>
                            <p className="text-xs text-muted-foreground self-end">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                        </Link>
                    </DropdownMenuItem>
                ))
            ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    You have no notifications.
                </div>
            )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
            <Check className="mr-2 h-4 w-4" /> Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

      