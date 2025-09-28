

'use client';

import { Card, CardContent } from '../ui/card';
import { Construction } from 'lucide-react';

export function PRNToPDF() {
  return (
    <Card className="flex flex-col items-center justify-center min-h-[300px]">
      <CardContent className="text-center">
        <Construction className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-semibold">Coming Soon!</h3>
        <p className="text-muted-foreground mt-2">
          The "PRN to PDF" tool is currently under development due to the complexity of the PRN file format.
        </p>
      </CardContent>
    </Card>
  );
}
