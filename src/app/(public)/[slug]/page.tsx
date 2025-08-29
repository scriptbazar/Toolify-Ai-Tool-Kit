
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { tools } from '@/lib/constants';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': CaseConverter,
};

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = tools.find((t) => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  const ToolComponent = toolComponents[tool.slug];

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
              
              <div className="min-h-[300px] rounded-lg bg-muted/50 p-8">
                {ToolComponent ? <ToolComponent /> : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-muted-foreground">
                      Tool interface coming soon!
                    </p>
                  </div>
                )}
              </div>

              {tool.slug === 'case-converter' && (
                <div className="prose prose-sm dark:prose-invert max-w-none mt-8 pt-6 border-t">
                    <p>The Case Converter tool is a versatile utility designed to make text manipulation effortless. Whether you're a writer, developer, or student, this tool helps you instantly switch your text between different case formats. With a simple click, you can convert your content to:</p>
                    <ul>
                        <li><strong>Sentence case:</strong> Capitalizes the first letter of each sentence, perfect for standard writing.</li>
                        <li><strong>lowercase:</strong> Converts all characters to their lowercase equivalents.</li>
                        <li><strong>UPPERCASE:</strong> Transforms all characters into their uppercase form for emphasis or headlines.</li>
                        <li><strong>Title Case:</strong> Capitalizes the first letter of every word, ideal for titles and headings.</li>
                    </ul>
                    <p>It also provides a real-time count of words and characters, helping you stay on top of your writing metrics. Simply type or paste your text, choose a conversion, and copy the result. It's that easy!</p>
                </div>
              )}

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
