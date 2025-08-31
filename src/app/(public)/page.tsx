
import { Button } from '@/components/ui/button';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { CategoryCard } from '@/components/tools/CategoryCard';
import { toolCategories } from '@/lib/constants';
import { getTools } from '@/ai/flows/tool-management';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const tools = await getTools();
  const activeTools = tools.filter(tool => tool.status === 'Active');

  return (
    <>
      <section className="text-center py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            The Ultimate All-in-One Toolkit
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Your one-stop-shop for productivity and creativity.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="#tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {toolCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          </div>
      </section>
      
      <section id="tools" className="container mx-auto px-4 py-8 md:py-12 space-y-16">
        {toolCategories.map((category) => (
          <div key={category.id}>
            <div id={category.id} className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
              <p className="mt-2 text-muted-foreground">{category.description}</p>
            </div>
            <ToolGrid tools={activeTools.filter(tool => tool.category === category.id)} />
          </div>
        ))}
      </section>
    </>
  );
}
