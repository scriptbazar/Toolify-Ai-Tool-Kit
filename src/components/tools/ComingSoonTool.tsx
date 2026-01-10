
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface ComingSoonToolProps {
  toolName: string;
  description: string;
}

export function ComingSoonTool({ toolName, description }: ComingSoonToolProps) {
  return (
    <Card className="text-center p-8 border-dashed border-2">
      <CardContent className="p-0 flex flex-col items-center">
        <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Coming Soon: {toolName}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {description} Our team is hard at work to bring you this new tool. Stay tuned!
        </p>
      </CardContent>
    </Card>
  );
}
