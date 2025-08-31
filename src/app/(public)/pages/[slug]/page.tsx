
import { getSettings } from '@/ai/flows/settings-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import PublicLayout from '@/app/(public)/layout';


export async function generateStaticParams() {
  const settings = await getSettings();
  
  const pageParams = settings.page?.pages.map((page) => ({
    slug: page.slug,
  })) || [];

  return pageParams;
}


export default async function CustomPage({ params }: { params: { slug: string } }) {
  const settings = await getSettings();
  const page = settings.page?.pages.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  return (
    <PublicLayout>
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
    </PublicLayout>
  );
}
