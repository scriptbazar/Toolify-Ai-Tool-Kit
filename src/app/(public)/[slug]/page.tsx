
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaseConverter } from '@/components/tools/CaseConverter';
import { getTools } from '@/ai/flows/tool-management';
import * as Icons from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

const toolComponents: { [key: string]: React.ComponentType } = {
  'case-converter': CaseConverter,
};

export default async function ToolPage({ params }: { params: { slug:string } }) {
  const tools = await getTools();
  const tool = tools.find((t) => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  const ToolComponent = toolComponents[tool.slug];
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-primary" />
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
                    <h2 className="text-2xl font-bold">✨ About the Case Converter Tool</h2>
                    <p>Our Case Converter is a powerful and easy-to-use utility designed to make text manipulation effortless. Whether you are a writer, developer, designer, or student, this tool will help you instantly transform your text into the desired format with just a single click. It's built to save you time and streamline your workflow.</p>
                    
                    <h3 className="text-xl font-semibold mt-6">🔑 Key Features:</h3>
                    <ul>
                        <li><strong>Sentence case:</strong> Automatically capitalizes the first letter of each sentence. Ideal for standard writing and proofreading.</li>
                        <li><strong>lowercase:</strong> Converts all characters in your text to their lowercase equivalents, perfect for standardizing data or text.</li>
                        <li><strong>UPPERCASE:</strong> Transforms all characters into their uppercase form, which is great for creating headlines, titles, or for emphasis.</li>
                        <li><strong>Title Case:</strong> Capitalizes the first letter of every word. This is particularly useful for formatting headlines, titles of articles, and headings in documents.</li>
                        <li><strong>Word & Character Count:</strong> Get a real-time count of words and characters as you type, helping you stay on top of your writing metrics.</li>
                    </ul>

                    {/* Placeholder for future in-description ad */}
                    <div className="my-6">
                        <AdPlaceholder adSlotId="toolpage-in-description" />
                    </div>

                    <h3 className="text-xl font-semibold mt-6">🚀 How to Use:</h3>
                    <ol>
                        <li><strong>Enter Text:</strong> Simply type or paste the text you want to convert into the provided text area.</li>
                        <li><strong>Choose Conversion:</strong> Click one of the four conversion buttons (Sentence case, lowercase, UPPERCASE, Title Case) to instantly transform your text.</li>
                        <li><strong>Copy Result:</strong> Use the copy button to grab your newly formatted text and use it wherever you need.</li>
                    </ol>

                    <h3 className="text-xl font-semibold mt-6">💡 Why Use Our Tool?</h3>
                    <p>The Case Converter provides a clean, intuitive interface that ensures a seamless user experience. With its variety of conversion options and helpful metrics, you can format your text exactly how you need it in seconds. Simply type or paste, choose a conversion, and copy the result. It's that easy!</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
        <aside className="w-full lg:w-80 mt-8 lg:mt-0">
          <AdPlaceholder adSlotId="toolpage-sidebar" />
        </aside>
      </div>
    </div>
  );
}
