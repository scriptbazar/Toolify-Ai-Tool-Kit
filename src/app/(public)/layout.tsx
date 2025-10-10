
'use client';

import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { AdBlockerDetector } from '@/components/common/AdBlockerDetector';
import { ClientDynamicChatWidget } from '@/components/common/ClientDynamicChatWidget';
import { DevelopmentNoticeDialog } from '@/components/common/DevelopmentNoticeDialog';
import { AuthContextProvider } from '@/context/AuthContext';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <FirebaseErrorListener />
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background">{children}</main>
        <ClientDynamicChatWidget />
        <Footer />
        <AdBlockerDetector />
        <DevelopmentNoticeDialog />
      </div>
    </AuthContextProvider>
  );
}
