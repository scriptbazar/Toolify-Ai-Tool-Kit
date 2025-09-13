
'use client';

import Link from 'next/link';
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
            return <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow">Maintenance</Badge>;
        case 'Coming Soon':
            return <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white shadow">Coming Soon</Badge>;
        case 'New Version':
            return <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white shadow">New Version</Badge>;
        default:
            return null;
    }
}

export function ToolCard({ tool }: ToolCardProps) {
  const { name, description, slug, status } = tool;
  const Icon = (Icons as any)[tool.icon] || Icons.HelpCircle;
  const statusBadge = getStatusBadge(status);

  const isClickable = status === 'Active' || status === 'New Version';

  const CardContent = () => (
    <div className="relative group h-full w-full">
      <div className={cn(
        "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 opacity-25 blur transition duration-500 group-hover:opacity-75",
        !isClickable && "opacity-10 blur-sm"
      )}></div>
      <div className={cn(
        "relative flex h-full flex-col items-center justify-start rounded-lg border bg-card p-6 text-center shadow-lg transition-all duration-300 group-hover:-translate-y-1",
        !isClickable && "opacity-70"
      )}>
        {statusBadge ? statusBadge : (
            <>
              {tool.isNew && <Badge variant="outline" className="absolute top-2 left-2 border-primary text-primary bg-background/80 shadow">New</Badge>}
              {tool.plan === 'Pro' && <Badge className="absolute top-2 right-2 shadow">Pro</Badge>}
            </>
        )}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 transition-colors group-hover:bg-primary/20">
          <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
        </div>
        <div className="flex-grow">
            <h3 className="text-sm font-semibold mb-1">{name}</h3>
            <p className="text-xs text-muted-foreground h-10 overflow-hidden">
                {description}
            </p>
        </div>
      </div>
    </div>
  );

  if (isClickable) {
      return (
        <Link href={`/tools/${slug}`} className="block h-full">
          <CardContent />
        </Link>
      );
  }

  return <CardContent />;
}
