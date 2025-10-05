
'use client';

import dynamic from 'next/dynamic';

const DynamicChatWidget = dynamic(() => import('@/components/common/DynamicChatWidget').then(mod => mod.DynamicChatWidget), {
  ssr: false,
});

export function ClientDynamicChatWidget() {
  return <DynamicChatWidget />;
}
