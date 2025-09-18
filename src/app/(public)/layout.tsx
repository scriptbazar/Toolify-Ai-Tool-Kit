

import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { AdBlockerDetector } from '@/components/common/AdBlockerDetector';
import { DynamicChatWidget } from '@/components/common/DynamicChatWidget';


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
    </div>
  );
}
