
import { getSettings } from '@/ai/flows/settings-management';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateStaticParams() {
  try {
    const settings = await getSettings();
    return settings.page?.pages.map((page) => ({
      slug: page.slug,
    })) || [];
  } catch (error) {
    console.error("Failed to generate static params for pages:", error);
    return [];
  }
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const settings = await getSettings();
  const page = settings.page?.pages.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Card>
            <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">{page.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div 
                    className="prose dark:prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: page.content || '' }} 
                />
            </CardContent>
        </Card>
    </div>
  );
}
