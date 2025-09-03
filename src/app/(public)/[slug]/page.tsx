
import { getSettings } from '@/ai/flows/settings-management';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateStaticParams() {
  const settings = await getSettings();
  const pages = settings.page?.pages || [];
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const settings = await getSettings();
  const page = settings.page?.pages.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />
        </CardContent>
      </Card>
    </div>
  );
}
