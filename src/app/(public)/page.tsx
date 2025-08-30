
import { ToolGrid } from '@/components/tools/ToolGrid';
import { AdPlaceholder } from '@/components/common/AdPlaceholder';
import { toolCategories } from '@/lib/constants';
import { getTools } from '@/ai/flows/tool-management';

export default async function Home() {
  const tools = await getTools();
  const activeTools = tools.filter(tool => tool.status === 'Active');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
          ToolifyAI
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Your All-in-One Smart Toolkit. Over 100 utilities to boost your productivity.
        </p>
      </header>

      <section className="space-y-16">
        {toolCategories.map((category, index) => (
          <div key={category.id}>
            <div id={category.id} className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
              <p className="mt-2 text-muted-foreground">{category.description}</p>
            </div>
            <ToolGrid tools={activeTools.filter(tool => tool.category === category.id)} />
            {index === 1 && <AdPlaceholder className="mt-12" />}
          </div>
        ))}
      </section>

      <AdPlaceholder className="mt-16" />
    </div>
  );
}
