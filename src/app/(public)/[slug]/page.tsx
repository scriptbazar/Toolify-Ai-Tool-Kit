import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tools } from '@/lib/constants';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = tools.find((t) => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <tool.Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-bold">{tool.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{tool.description}</p>
              <div className="min-h-[300px] flex items-center justify-center rounded-lg bg-muted/50 p-8">
                <p className="text-lg text-muted-foreground">
                  Tool interface coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <aside className="w-full lg:w-80 mt-8 lg:mt-0">
          <AdPlaceholder />
        </aside>
      </div>
    </div>
  );
}
