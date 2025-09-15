
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the ChatWidget with ssr: false
const ChatWidget = dynamic(
  () => import('@/components/common/ChatWidget').then(mod => mod.ChatWidget),
  {
    ssr: false,
    loading: () => <div className="fixed bottom-6 right-6 z-50"><Skeleton className="h-12 w-12 rounded-full" /></div>
  }
);

export function DynamicChatWidget() {
  return <ChatWidget />;
}
