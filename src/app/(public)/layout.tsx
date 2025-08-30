
import { ChatWidget } from '@/components/common/ChatWidget';
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { cn } from '@/lib/utils';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('relative flex min-h-screen flex-col')}>
      <Header />
      <main className="flex-1">{children}</main>
      <ChatWidget />
      <Footer />
    </div>
  );
}
