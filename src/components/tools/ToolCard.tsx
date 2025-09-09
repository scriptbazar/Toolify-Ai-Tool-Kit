

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Tool } from '@/ai/flows/tool-management.types';
import * as Icons from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

type ToolCardProps = {
  tool: Tool;
};

const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
        case 'Maintenance':
            return <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">Maintenance</Badge>;
        case 'Coming Soon':
            return <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">Coming Soon</Badge>;
        case 'New Version':
            return <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">New Version</Badge>;
        default:
            return null;
    }
}

export function ToolCard({ tool }: ToolCardProps) {
  const { name, description, slug, status } = tool;
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  const statusBadge = getStatusBadge(status);

  return (
    <Link href={`/tools/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary p-6 flex flex-col items-center text-center relative overflow-hidden">
        {statusBadge ? statusBadge : (
            <>
              {tool.isNew && <Badge variant="outline" className="absolute top-2 left-2 text-primary border-primary">New</Badge>}
              {tool.plan === 'Pro' && <Badge className="absolute top-2 right-2">Pro</Badge>}
            </>
        )}
        <Icon className="h-8 w-8 mb-4 text-primary transition-colors" />
        <CardContent className="p-0 flex flex-col flex-grow justify-center">
          <h3 className="text-sm font-medium mb-1">{name}</h3>
          <p className="text-xs text-muted-foreground h-10">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
