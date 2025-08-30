
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Tool } from '@/ai/flows/tool-management.types';
import * as Icons from 'lucide-react';

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const { name, description, slug } = tool;
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;


  return (
    <Link href={`/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary p-6 flex flex-col items-center text-center">
        <Icon className="h-8 w-8 mb-4 text-muted-foreground transition-colors group-hover:text-primary" />
        <CardContent className="p-0 flex flex-col flex-grow justify-center">
          <h3 className="text-sm font-medium mb-1">{name}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
