
'use client';

import { useState, useEffect } from 'react';
import { getChatUsers } from '@/ai/flows/user-management';
import { useToast } from '@/hooks/use-toast';
import { CommunityChat } from '@/components/common/CommunityChat';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/common/Logo';
import { Loader2 } from 'lucide-react';

interface ChatUser {
    id: string;
    initials: string;
    name: string;
    username: string;
    createdAt?: string | null;
    lastActive?: string | null;
}

export default function CommunityChatPage() {
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch users
    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const usersList = await getChatUsers();
                setAllUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ title: "Error", description: "Could not load community members.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        
        fetchUsers();
    }, [toast]);
    
    if (loading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-transparent">
              <Logo className="h-16 w-16 animate-pulse" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-lg">Loading Chat...</p>
              </div>
            </div>
          );
    }
    
    return <CommunityChat allUsers={allUsers} isAdmin={false} />;
}
