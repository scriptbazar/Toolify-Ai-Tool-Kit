

import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { AdBlockerDetector } from '@/components/common/AdBlockerDetector';
import dynamic from 'next/dynamic';
import { DevelopmentNoticeDialog } from '@/components/common/DevelopmentNoticeDialog';

const DynamicChatWidget = dynamic(() => import('@/components/common/DynamicChatWidget').then(mod => mod.DynamicChatWidget), {
  ssr: false,
});


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <DynamicChatWidget />
      <Footer />
      <AdBlockerDetector />
      <DevelopmentNoticeDialog />
    </div>
  );
}
