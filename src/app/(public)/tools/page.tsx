import { getTools } from '@/ai/flows/tool-management';
import { ToolsPageClient } from './_components/ToolsPageClient';

export default async function ToolsDashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Fetch ALL tools once on the server.
  const allTools = await getTools();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Our Tools</h1>
        <p className="mt-4 text-muted-foreground">
          Discover our comprehensive suite of 100+ powerful and easy-to-use tools.
        </p>
      </div>

      <ToolsPageClient allTools={allTools} />
    </div>
  );
}