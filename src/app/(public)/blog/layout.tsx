
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toolify AI Blog',
  description: 'Stay updated with the latest news, tips, and tutorials from our team.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
